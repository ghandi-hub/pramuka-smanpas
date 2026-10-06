import { randomUUID } from "node:crypto";
import { requireAuthUser } from "~~/server/utils/userAuth";
import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event);
  const body = await readBody(event);
  const { point_id, notes, evidence_url } = body ?? {};

  const db = await getDb();
  const now = new Date();
  const collection = db.collection("sku_progress");

  await collection.updateOne(
    { user_id: user.id, point_id },
    {
      $set: {
        status: "pending",
        notes,
        evidence_url,
        submitted_at: now,
        updated_at: now,
      },
      $setOnInsert: {
        id: randomUUID(),
        user_id: user.id,
        point_id,
        created_at: now,
      },
    },
    { upsert: true },
  );

  const doc = await collection.findOne({ user_id: user.id, point_id });
  return transformDocument(doc);
});