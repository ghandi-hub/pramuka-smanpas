import type { H3Event } from "h3";
import { getDb, toMongoIdFilter, transformDocument } from "~~/server/utils/mongo";

type VerifyType = "sku" | "skk";
type VerifyStatus = "verified" | "rejected";

function requireAdmin(event: H3Event) {
  const auth = event.context.auth as { id?: string; role?: string } | undefined;
  if (!auth || auth.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required",
    });
  }
  return auth;
}

export default defineEventHandler(async (event) => {
  const auth = requireAdmin(event);

  const body = (await readBody(event)) || {};
  const type = body.type as VerifyType;
  const id = body.id;
  const status = body.status as VerifyStatus;
  const adminNotes = body.admin_notes;

  if (type !== "sku" && type !== "skk") {
    throw createError({ statusCode: 400, statusMessage: "Parameter type tidak valid" });
  }
  if (id === undefined || id === null || String(id).trim() === "") {
    throw createError({ statusCode: 400, statusMessage: "Parameter id wajib diisi" });
  }
  if (status !== "verified" && status !== "rejected") {
    throw createError({ statusCode: 400, statusMessage: "Parameter status tidak valid" });
  }

  const collectionName = type === "sku" ? "sku_progress" : "skk_progress";
  const db = await getDb();
  const collection = db.collection(collectionName);
  const filter = toMongoIdFilter(String(id));

  const now = new Date();
  const updateFields: Record<string, any> = {
    status,
    admin_notes: adminNotes ?? null,
    verifier_id: auth.id ?? null,
    verified_at: now,
    updated_at: now,
  };

  const updatedDoc = await collection.findOneAndUpdate(
    filter,
    { $set: updateFields },
    { returnDocument: "after" },
  );

  if (!updatedDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Data tidak ditemukan",
    });
  }

  const transformed = transformDocument<any>(updatedDoc);
  transformed.type = type;
  return transformed;
});