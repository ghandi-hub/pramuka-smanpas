import { getHeader, getRequestIP, createError, type H3Event } from "h3";

export interface RateLimitOptions {
  key: string;
  windowMs: number;
  max: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastPrune = Date.now();
const PRUNE_INTERVAL_MS = 60 * 1000;

function pruneExpired(now: number): void {
  if (now - lastPrune < PRUNE_INTERVAL_MS && rateLimitStore.size < 1000) {
    return;
  }
  lastPrune = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    pruneExpired(Date.now());
  }, PRUNE_INTERVAL_MS);
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
}

export function checkRateLimit(
  event: H3Event,
  options: {
    key: string;
    windowMs: number;
    max: number;
    message?: string;
  },
): void {
  const now = Date.now();
  pruneExpired(now);

  const rawForwarded = getHeader(event, "x-forwarded-for");
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ||
    (rawForwarded ? rawForwarded.split(",")[0].trim() : undefined) ||
    "127.0.0.1";

  const key = `${options.key}:${ip}`;
  let entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + options.windowMs };
    rateLimitStore.set(key, entry);
  } else {
    entry.count += 1;
  }

  if (entry.count > options.max) {
    throw createError({
      statusCode: 429,
      statusMessage:
        options.message ||
        "Terlalu banyak permintaan. Silakan coba lagi nanti.",
    });
  }
}
