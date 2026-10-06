import { getDb, toMongoIdFilter, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = (await readBody(event)) || {};

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID tidak ditemukan",
    });
  }

  const db = await getDb();
  const filter = toMongoIdFilter(id);

  const { _id, id: bodyId, ...updateFields } = body;
  updateFields.updated_at = new Date().toISOString();

  // If email is updated, also update users table
  if (updateFields.email) {
    const normalizedEmail = String(updateFields.email).toLowerCase().trim();
    updateFields.email = normalizedEmail;

    // Check collision
    const existing = await db.collection("users").findOne({
      email: normalizedEmail,
      id: { $ne: String(id) },
      _id: { $ne: String(id) },
    });

    if (existing) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email sudah digunakan oleh akun lain.",
      });
    }

    await db.collection("users").updateOne(filter, {
      $set: {
        email: normalizedEmail,
        updated_at: new Date().toISOString(),
      },
    });
  }

  // Update profile
  const updatedDoc = await db
    .collection("profiles")
    .findOneAndUpdate(
      filter,
      { $set: updateFields },
      { returnDocument: "after" },
    );

  if (!updatedDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "User tidak ditemukan",
    });
  }

  return transformDocument(updatedDoc);
});
