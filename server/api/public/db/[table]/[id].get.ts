import { getDb, toMongoIdFilter, transformDocument } from "~~/server/utils/mongo";

const PUBLIC_TABLE_WHITELIST = [
  "activities",
  "galleries",
  "organization_members",
  "abouts",
  "twibbon_campaigns",
];

const FORBIDDEN_TABLES = new Set([
  "users",
  "profiles",
  "contact_messages",
  "refresh_tokens",
  "password_resets",
  "email_verifications",
]);

export default defineEventHandler(async (event) => {
  const table = getRouterParam(event, "table");
  const id = getRouterParam(event, "id");

  if (
    !table ||
    !id ||
    FORBIDDEN_TABLES.has(table) ||
    !PUBLIC_TABLE_WHITELIST.includes(table)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Akses ke tabel ditolak",
    });
  }

  const db = await getDb();
  const collection = db.collection(table);
  const filter = toMongoIdFilter(id);

  const doc = await collection.findOne(filter);
  if (!doc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Data tidak ditemukan",
    });
  }

  return transformDocument(doc);
});
