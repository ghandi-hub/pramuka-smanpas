import { getDb, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID tidak ditemukan",
    });
  }

  const db = await getDb();
  const idFilter = toMongoIdFilter(id);
  const userRelFilter = { $or: [{ user_id: String(id) }, { user_id: id }] };

  // Cascade delete across all related collections
  await Promise.all([
    db.collection("users").deleteOne(idFilter),
    db.collection("profiles").deleteOne(idFilter),
    db.collection("refresh_tokens").deleteMany(userRelFilter),
    db.collection("email_verifications").deleteMany(userRelFilter),
    db.collection("password_resets").deleteMany(userRelFilter),
  ]);

  return { message: "User berhasil dihapus" };
});
