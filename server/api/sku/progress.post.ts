import { randomUUID } from "node:crypto";
import { requireAuthUser } from "~~/server/utils/userAuth";
import { getDb, transformDocument } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event);
  const body = await readBody(event);
  const { point_id, notes, evidence_url, evidence_photos } = body ?? {};

  if (!point_id || String(point_id).trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Butir SKU tidak valid.",
    });
  }

  // Bukti foto wajib (minimal 1). Terima evidence_url lama sebagai fallback.
  const photos = Array.isArray(evidence_photos)
    ? evidence_photos.filter((p: unknown) => typeof p === "string" && p.trim())
    : evidence_url
      ? [String(evidence_url)]
      : [];

  if (photos.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bukti foto wajib diunggah. Minimal 1 foto.",
    });
  }

  const db = await getDb();
  const now = new Date();
  const collection = db.collection("sku_progress");

  // Cari butir SKU untuk mengetahui tingkatannya.
  const pointIdStr = String(point_id);
  const item = await db.collection("sku_items").findOne({
    $or: [{ id: pointIdStr }, { _id: pointIdStr }],
  });

  // Prasyarat: tingkat Laksana terkunci jika sisa butir Bantara belum lulus >= 3.
  if (item?.level === "laksana") {
    const bantaraItems = await db
      .collection("sku_items")
      .find({ level: "bantara" })
      .project({ id: 1, _id: 1 })
      .toArray();

    const bantaraIds: string[] = [];
    for (const b of bantaraItems) {
      if (b.id) bantaraIds.push(String(b.id));
      if (b._id) bantaraIds.push(String(b._id));
    }

    const totalBantara = bantaraItems.length;
    const verifiedBantara = totalBantara
      ? await collection.countDocuments({
          user_id: user.id,
          status: "verified",
          point_id: { $in: bantaraIds },
        })
      : 0;

    const remaining = totalBantara - verifiedBantara;
    if (remaining >= 3) {
      throw createError({
        statusCode: 400,
        statusMessage: `Tingkat Laksana masih terkunci. Selesaikan butir Bantara terlebih dahulu — maksimal 2 butir Bantara boleh belum lulus, saat ini ${remaining} butir belum lulus.`,
      });
    }
  }

  await collection.updateOne(
    { user_id: user.id, point_id },
    {
      $set: {
        status: "pending",
        notes,
        evidence_photos: photos,
        evidence_url: photos[0],
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