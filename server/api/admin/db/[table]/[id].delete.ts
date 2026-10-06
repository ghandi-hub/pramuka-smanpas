import { getDb, toMongoIdFilter } from "~~/server/utils/mongo";

const ADMIN_TABLE_WHITELIST = [
  "activities",
  "galleries",
  "organization_members",
  "contact_messages",
  "profiles",
  "twibbon_campaigns",
  "abouts",
];

export default defineEventHandler(async (event) => {
  const table = getRouterParam(event, "table");
  const id = getRouterParam(event, "id");

  if (!table || !id || !ADMIN_TABLE_WHITELIST.includes(table)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tabel dan ID wajib diisi dengan valid",
    });
  }

  const db = await getDb();
  const collection = db.collection(table);
  const filter = toMongoIdFilter(id);

  const result = await collection.deleteOne(filter);

  if (result.deletedCount === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Data tidak ditemukan atau sudah dihapus",
    });
  }

  return { message: "Data berhasil dihapus" };
});
