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

  let decoded: any;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: "Sesi kedaluwarsa",
    });
  }

  const body = (await readBody(event)) || {};
  const { name, email, avatar_url } = body;
  const db = await getDb();
  const currentUserId = String(decoded.id);

  // Check if email is being updated and if it already exists for another user
  if (email) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await db.collection("users").findOne({
      email: normalizedEmail,
      id: { $ne: currentUserId },
      _id: { $ne: currentUserId },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email sudah digunakan oleh akun lain.",
      });
    }

    // Update email in users table
    await db.collection("users").updateOne(toMongoIdFilter(currentUserId), {
      $set: {
        email: normalizedEmail,
        updated_at: new Date().toISOString(),
      },
    });
  }

  // Update profile
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) updateData.name = String(name).trim();
  if (email !== undefined) updateData.email = String(email).toLowerCase().trim();
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

  const updatedProfile = await db
    .collection("profiles")
    .findOneAndUpdate(
      toMongoIdFilter(currentUserId),
      { $set: updateData },
      { returnDocument: "after" },
    );

  if (!updatedProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: "Profil tidak ditemukan",
    });
  }

  return transformDocument(updatedProfile);
});
