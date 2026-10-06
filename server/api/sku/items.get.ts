import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const db = await getDb();
  const filter: Record<string, any> = {};

  if (query.level) {
    const levelStr = String(query.level).toLowerCase();
    if (levelStr === "bantara" || levelStr === "laksana") {
      filter.level = levelStr;
    }
  }

  const items = await db
    .collection("sku_items")
    .find(filter)
    .sort({ point_number: 1 })
    .toArray();

  return items.map((item) => transformDocument(item));
});
