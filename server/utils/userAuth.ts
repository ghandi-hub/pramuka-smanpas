import type { H3Event } from "h3";
import { verifyToken } from "./jwt";

export interface AuthUser {
  id: string;
  role: string;
}

export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  let token: string | undefined;
  const authHeader = getHeader(event, "Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = getCookie(event, "auth_token");
  }

  if (!token) return null;

  try {
    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return null;
    return {
      id: String(decoded.id),
      role: decoded.role || "member",
    };
  } catch {
    return null;
  }
}

export async function requireAuthUser(event: H3Event): Promise<AuthUser> {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Silakan login terlebih dahulu untuk mengakses fitur ini.",
    });
  }
  return user;
}
