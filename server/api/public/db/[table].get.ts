import { getDb, transformDocument, toMongoIdFilter } from "~~/server/utils/mongo";

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

  if (!table || FORBIDDEN_TABLES.has(table) || !PUBLIC_TABLE_WHITELIST.includes(table)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Akses ke tabel ditolak",
    });
  }

  const query = getQuery(event);
  const db = await getDb();
  const collection = db.collection(table);

  // Build filter safely to prevent NoSQL injection
  let filter: Record<string, any> = {};

  if (query.field !== undefined && query.value !== undefined) {
    const field = String(query.field);
    if (!/^[a-zA-Z0-9_]+$/.test(field)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nama field filter tidak valid",
      });
    }

    const rawValue = String(query.value);

    if (field === "id") {
      filter = toMongoIdFilter(rawValue);
    } else if (rawValue === "true" || rawValue === "false") {
      const boolVal = rawValue === "true";
      filter = { $or: [{ [field]: boolVal }, { [field]: rawValue }] };
    } else if (!Number.isNaN(Number(rawValue)) && rawValue.trim() !== "") {
      const numVal = Number(rawValue);
      filter = { $or: [{ [field]: numVal }, { [field]: rawValue }] };
    } else {
      filter = { [field]: rawValue };
    }
  }

  // Count requested
  if (query.count === "true") {
    const count = await collection.countDocuments(filter);
    return { count };
  }

  // Ordering
  let sortField = "created_at";
  if (query.orderBy) {
    const fieldCandidate = String(query.orderBy);
    if (/^[a-zA-Z0-9_]+$/.test(fieldCandidate)) {
      sortField = fieldCandidate;
    }
  }
  const sortDirection = query.ascending === "true" ? 1 : -1;
  const sort = { [sortField]: sortDirection } as const;

  // Single record requested
  if (query.single === "true") {
    const doc = await collection.findOne(filter, { sort });
    return doc ? transformDocument(doc) : null;
  }

  // List records
  let cursor = collection.find(filter).sort(sort);

  if (query.limit) {
    const limitNum = parseInt(String(query.limit), 10);
    if (!Number.isNaN(limitNum) && limitNum > 0) {
      cursor = cursor.limit(limitNum);
    }
  }

  const list = await cursor.toArray();
  return transformDocument(list);
});
