import { comparePassword, hashPassword } from "~~/server/utils/hash";
import { verifyToken } from "~~/server/utils/jwt";
import { getDb, toMongoIdFilter } from "~~/server/utils/mongo";

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

  let decoded: any;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: "Sesi kedaluwarsa",
    });
  }

  const body = await readBody(event);
  const { old_password, new_password } = body;

  if (!old_password || !new_password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password lama dan password baru wajib diisi.",
    });
  }

  const db = await getDb();
  const filter = toMongoIdFilter(String(decoded.id));

  // Get user's current password hash
  const user = await db.collection("users").findOne(filter);

  if (!user || !user.password_hash) {
    throw createError({
      statusCode: 404,
      statusMessage: "User tidak ditemukan",
    });
  }

  // Verify old password
  const isMatch = await comparePassword(old_password, user.password_hash);
  if (!isMatch) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password lama salah.",
    });
  }

  // Hash new password
  const passwordHash = await hashPassword(new_password);

  // Update password in users
  await db.collection("users").updateOne(filter, {
    $set: {
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    },
  });

  return {
    message: "Password berhasil diubah.",
  };
});
