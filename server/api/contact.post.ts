import { getDb, prepareDocumentForInsert } from "~~/server/utils/mongo";
import { sendMail } from "~~/server/utils/mailer";

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per minute per IP

// Minimum time (ms) the form should take to fill — bots submit instantly
const MIN_FORM_TIME = 3000; // 3 seconds

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function sanitize(input: string): string {
  return input
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 2000); // Cap length
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const VALID_SUBJECTS = ["join", "collab", "general"];

export default defineEventHandler(async (event) => {
  // --- Rate Limiting ---
  const forwarded = getHeader(event, "x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    getHeader(event, "x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
    });
  }

  // --- Read Body ---
  const body = await readBody(event);

  // --- Honeypot Check ---
  // If the hidden "website" field is filled, it's a bot
  if (body.website) {
    // Silently accept but don't save — don't reveal to bot that it failed
    return { success: true };
  }

  // --- Timing Check ---
  const formLoadedAt = body._formLoadedAt;
  if (formLoadedAt) {
    const elapsed = Date.now() - Number(formLoadedAt);
    if (elapsed < MIN_FORM_TIME) {
      // Submitted too fast — likely a bot
      return { success: true };
    }
  } else {
    // Missing timestamp — suspicious
    return { success: true };
  }

  // --- Input Validation ---
  const { full_name, email, subject, message } = body;

  if (
    !full_name ||
    typeof full_name !== "string" ||
    full_name.trim().length < 2
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nama lengkap wajib diisi (minimal 2 karakter).",
    });
  }

  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    throw createError({
      statusCode: 400,
      statusMessage: "Alamat email tidak valid.",
    });
  }

  if (!subject || !VALID_SUBJECTS.includes(subject)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Subject tidak valid.",
    });
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Pesan wajib diisi (minimal 10 karakter).",
    });
  }

  if (message.length > 2000) {
    throw createError({
      statusCode: 400,
      statusMessage: "Pesan terlalu panjang (maksimal 2000 karakter).",
    });
  }

  // --- Spam content heuristics ---
  const spamPatterns = [
    /\b(viagra|casino|lottery|crypto|bitcoin|click here|buy now|free money)\b/i,
    /(http[s]?:\/\/[^\s]+){3,}/i, // 3+ URLs in message
  ];

  const combinedText = `${full_name} ${message}`;
  for (const pattern of spamPatterns) {
    if (pattern.test(combinedText)) {
      // Silently reject
      return { success: true };
    }
  }

  // --- Save to MongoDB ---
  const db = await getDb();
  const contactDoc = prepareDocumentForInsert({
    full_name: sanitize(full_name),
    email: sanitize(email),
    subject: sanitize(subject),
    message: sanitize(message),
    status: "new",
  });

  try {
    await db.collection("contact_messages").insertOne(contactDoc);
  } catch (err: any) {
    console.error("[contact.post] MongoDB insert error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal mengirim pesan: ${err.message}`,
    });
  }

  // --- Send email notification ---
  const config = useRuntimeConfig();
  const targetEmail = config.emailUser;

  if (targetEmail) {
    try {
      const emailHtml = `
        <h2>Pesan Kontak Baru Masuk</h2>
        <p><strong>Pengirim:</strong> ${sanitize(full_name)} (${sanitize(email)})</p>
        <p><strong>Kategori:</strong> ${sanitize(subject)}</p>
        <p><strong>Pesan:</strong></p>
        <div style="background-color: #f4f4f4; padding: 12px; border-radius: 6px;">
          ${sanitize(message).replace(/\n/g, "<br>")}
        </div>
      `;

      await sendMail(
        targetEmail,
        `Pesan Kontak Baru: [${sanitize(subject)}] dari ${sanitize(full_name)}`,
        emailHtml,
      );
    } catch (mailError) {
      console.error("[contact.post] Error sending email notification:", mailError);
    }
  }

  return { success: true };
});
