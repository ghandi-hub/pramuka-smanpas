import { randomUUID } from "node:crypto";
import { requireAuthUser } from "~~/server/utils/userAuth";
import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event);
  const body = await readBody(event);
  const { skk_id, level, notes, evidence_url } = body ?? {};

  const db = await getDb();
  const now = new Date();
  const collection = db.collection("skk_progress");

  await collection.updateOne(
    { user_id: user.id, skk_id, level },
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
        skk_id,
        level,
        created_at: now,
      },
    },
    { upsert: true },
  );

  const doc = await collection.findOne({ user_id: user.id, skk_id, level });
  return transformDocument(doc);
});