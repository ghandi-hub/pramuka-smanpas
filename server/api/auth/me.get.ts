import { verifyToken } from "~~/server/utils/jwt";
import { getDb, toMongoIdFilter, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Token tidak ditemukan",
    });
  }

  try {
    const decoded = verifyToken(token) as any;
    const db = await getDb();

    // Fetch profile
    const profile = await db
      .collection("profiles")
      .findOne(toMongoIdFilter(String(decoded.id)));

    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: "User tidak ditemukan",
      });
    }

    const transformed = transformDocument(profile);
    return {
      id: transformed.id,
      name: transformed.name,
      email: transformed.email,
      role: transformed.role,
      avatar_url: transformed.avatar_url,
      created_at: transformed.created_at,
    };
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 401,
      statusMessage: "Sesi kedaluwarsa",
    });
  }
});
