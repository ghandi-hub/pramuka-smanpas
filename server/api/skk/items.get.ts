import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const db = await getDb();
  const filter: Record<string, any> = {};
  const conditions: Array<Record<string, any>> = [];

  if (query.field) {
    const fieldVal = String(query.field).trim();
    conditions.push({
      $or: [
        { color_code: fieldVal.toLowerCase() },
        { color: { $regex: new RegExp(`^${fieldVal}$`, "i") } },
        { field: { $regex: new RegExp(fieldVal, "i") } },
      ],
    });
  }

  if (query.is_wajib !== undefined) {
    const isWajib =
      query.is_wajib === true ||
      query.is_wajib === "true" ||
      query.is_wajib === "1" ||
      query.is_wajib === 1;
    conditions.push({
      $or: [{ is_wajib: isWajib }, { is_mandatory: isWajib }],
    });
  }

  if (conditions.length === 1) {
    Object.assign(filter, conditions[0]);
  } else if (conditions.length > 1) {
    filter.$and = conditions;
  }

  const items = await db
    .collection("skk_items")
    .find(filter)
    .sort({ order_number: 1 })
    .toArray();

  return items.map((item) => transformDocument(item));
});
