import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const db = await getDb();

  try {
    const profiles = await db
      .collection("profiles")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return transformDocument(profiles);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data user",
    });
  }
});
