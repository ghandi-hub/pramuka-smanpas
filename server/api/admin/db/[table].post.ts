import { getDb, prepareDocumentForInsert, transformDocument } from "~~/server/utils/mongo";

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

  if (!table || !ADMIN_TABLE_WHITELIST.includes(table)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tabel tidak diizinkan atau tidak valid",
    });
  }

  const body = (await readBody(event)) || {};
  const db = await getDb();
  const collection = db.collection(table);

  const documentToInsert = prepareDocumentForInsert(body);
  await collection.insertOne(documentToInsert);

  return transformDocument(documentToInsert);
});
