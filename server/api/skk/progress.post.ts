import { randomUUID } from "node:crypto";
import { requireAuthUser } from "~~/server/utils/userAuth";
import { getDb, transformDocument } from "~~/server/utils/mongo";

const LEVEL_ORDER = ["purwa", "madya", "utama"] as const;
type SkkLevel = (typeof LEVEL_ORDER)[number];

const LEVEL_INDEX: Record<string, number> = {
  purwa: 0,
  madya: 1,
  utama: 2,
};

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event);
  const body = await readBody(event);
  const { skk_id, level, notes, evidence_url, evidence_photos } = body ?? {};

  if (!skk_id || String(skk_id).trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Butir SKK tidak valid.",
    });
  }

  const levelStr = String(level ?? "").toLowerCase();
  if (!LEVEL_ORDER.includes(levelStr as SkkLevel)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tingkatan SKK tidak valid.",
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
  const collection = db.collection("skk_progress");

  // Prasyarat tingkatan: tingkat sebelumnya (skk_id sama) harus sudah verified.
  const currentIndex = LEVEL_INDEX[levelStr];
  if (currentIndex > 0) {
    const previousLevel = LEVEL_ORDER[currentIndex - 1];
    const previous = await collection.findOne({
      user_id: user.id,
      skk_id,
      level: previousLevel,
    });

    if (previous?.status !== "verified") {
      throw createError({
        statusCode: 400,
        statusMessage: `Tingkat ${previousLevel} untuk butir SKK ini harus lulus (verified) terlebih dahulu sebelum mengajukan tingkat ${levelStr}.`,
      });
    }
  }

  await collection.updateOne(
    { user_id: user.id, skk_id, level: levelStr },
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
        skk_id,
        level: levelStr,
        created_at: now,
      },
    },
    { upsert: true },
  );

  const doc = await collection.findOne({
    user_id: user.id,
    skk_id,
    level: levelStr,
  });
  return transformDocument(doc);
});