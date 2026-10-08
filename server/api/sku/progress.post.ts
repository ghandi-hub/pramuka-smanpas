import { randomUUID } from "node:crypto";
import { requireAuthUser } from "~~/server/utils/userAuth";
import { getDb, toMongoIdFilter, transformDocument } from "~~/server/utils/mongo";
import {
  parseSkuSubPointId,
  getPoint1SubPointIds,
  normalizeReligion,
  SKU_RELIGIONS,
} from "~~/shared/skuSubpoints";

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

  // Ambil profil user untuk memastikan agama yang dianut
  const userProfile = await db
    .collection("profiles")
    .findOne(toMongoIdFilter(user.id));
  const userReligion = normalizeReligion(userProfile?.religion);

  // Cari butir SKU untuk mengetahui tingkatannya.
  // Jika point_id berupa sub-butir (contoh: 'bantara-1_islam_0'), ambil base item ('bantara-1').
  const pointIdStr = String(point_id).trim();
  const parsedSub = parseSkuSubPointId(pointIdStr);
  const basePointId = parsedSub ? parsedSub.baseId : pointIdStr;

  // Validasi: Member hanya boleh mengisi sub-butir sesuai agamanya
  if (parsedSub?.religion && parsedSub.religion !== userReligion) {
    throw createError({
      statusCode: 400,
      statusMessage: `Anda hanya dapat mengisi butir keagamaan sesuai agama di profil Anda (${userReligion}).`,
    });
  }

  const item = await db.collection("sku_items").findOne({
    $or: [{ id: basePointId }, { _id: basePointId }],
  });

  const itemLevel =
    item?.level ?? (basePointId.startsWith("laksana") ? "laksana" : "bantara");

  // Prasyarat: tingkat Laksana terkunci jika sisa butir Bantara belum lulus >= 3.
  if (itemLevel === "laksana") {
    const bantaraItems = await db
      .collection("sku_items")
      .find({ level: "bantara" })
      .project({ id: 1, _id: 1, point_number: 1 })
      .toArray();

    const totalBantara = bantaraItems.length || 23;

    // Cek kelulusan Poin 1 Bantara:
    // Lulus jika ada record 'bantara-1' verified, ATAU seluruh sub-butir agama user verified.
    let point1Verified = false;
    const directP1 = await collection.findOne({
      user_id: user.id,
      status: "verified",
      $or: [{ point_id: "bantara-1" }, { sku_item_id: "bantara-1" }],
    });

    if (directP1) {
      point1Verified = true;
    } else {
      const userReligionSubIds = getPoint1SubPointIds("bantara", userReligion);
      const verifiedUserSubs = await collection.countDocuments({
        user_id: user.id,
        status: "verified",
        point_id: { $in: userReligionSubIds },
      });
      if (
        userReligionSubIds.length > 0 &&
        verifiedUserSubs === userReligionSubIds.length
      ) {
        point1Verified = true;
      }
    }

    // Butir Poin 2 s/d 23 Bantara
    const nonP1BantaraIds: string[] = [];
    for (const b of bantaraItems) {
      const bId = String(b.id ?? b._id ?? "");
      if (bId && bId !== "bantara-1") {
        nonP1BantaraIds.push(bId);
      }
    }

    const verifiedNonP1 = nonP1BantaraIds.length
      ? await collection.distinct("point_id", {
          user_id: user.id,
          status: "verified",
          point_id: { $in: nonP1BantaraIds },
        })
      : [];

    const verifiedBantaraCount = (point1Verified ? 1 : 0) + verifiedNonP1.length;
    const remaining = totalBantara - verifiedBantaraCount;
    if (remaining >= 3) {
      throw createError({
        statusCode: 400,
        statusMessage: `Tingkat Laksana masih terkunci. Selesaikan butir Bantara terlebih dahulu (maksimal 2 butir Bantara boleh belum lulus, saat ini ${remaining} butir belum lulus).`,
      });
    }
  }

  // Gunakan pemisahan ketat antara $set dan $setOnInsert untuk mencegah konflik path di MongoDB
  await collection.updateOne(
    { user_id: user.id, point_id: pointIdStr },
    {
      $set: {
        sku_item_id: pointIdStr,
        status: "pending",
        notes: notes ?? null,
        evidence_photos: photos,
        evidence_url: photos[0],
        submitted_at: now,
        updated_at: now,
      },
      $setOnInsert: {
        id: randomUUID(),
        user_id: user.id,
        point_id: pointIdStr,
        created_at: now,
      },
    },
    { upsert: true },
  );

  const doc = await collection.findOne({
    user_id: user.id,
    point_id: pointIdStr,
  });
  return transformDocument(doc);
});