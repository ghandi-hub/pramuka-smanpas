import { getAuthUser } from "~~/server/utils/userAuth";
import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) return [];

  const db = await getDb();
  const docs = await db
    .collection("skk_progress")
    .find({ user_id: user.id })
    .toArray();

  return docs.map((doc) => transformDocument(doc));
});