export function decodeJwtPayload(token: string | null | undefined): {
  id?: string;
  role?: string;
  exp?: number;
  iat?: number;
} | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const p1 = parts[1];
    if (!p1) return null;
    const base64 = p1.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null | undefined): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
}
