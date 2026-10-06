import * as Minio from "minio";
import { MongoClient } from "mongodb";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/pramuka_db";
const DB_NAME = process.env.MONGODB_DATABASE || "pramuka_db";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "127.0.0.1";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "pramuka";
const MINIO_PUBLIC_URL = (
  process.env.MINIO_PUBLIC_URL || "http://127.0.0.1:9000/pramuka"
).replace(/\/+$/, "");

const targets = [
  { collection: "activities", field: "cover_image" },
  { collection: "galleries", field: "image_url" },
  { collection: "organization_members", field: "photo" },
  { collection: "twibbon_campaigns", field: "frame_url" },
];

async function migrateImages() {
  console.log("Menghubungkan ke MongoDB & MinIO...");
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db(DB_NAME);

  const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  });

  const bucketExists = await minioClient.bucketExists(MINIO_BUCKET);
  if (!bucketExists) {
    await minioClient.makeBucket(MINIO_BUCKET);
    console.log(`Bucket '${MINIO_BUCKET}' berhasil dibuat.`);
  }

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const { collection: colName, field } of targets) {
    const col = db.collection(colName);
    const docs = await col
      .find({ [field]: { $regex: "res\\.cloudinary\\.com" } })
      .toArray();

    console.log(`\n[${colName}] Ditemukan ${docs.length} gambar Cloudinary.`);

    for (const doc of docs) {
      const oldUrl = doc[field];
      if (!oldUrl || typeof oldUrl !== "string") continue;

      try {
        // Ekstrak nama file asli dari URL
        const parsedUrl = new URL(oldUrl);
        const pathParts = parsedUrl.pathname.split("/");
        const originalFilename =
          pathParts[pathParts.length - 1] || `image-${doc._id}.jpg`;
        const key = `uploads/${colName}/${originalFilename}`;

        // 1. Download dari Cloudinary
        const res = await fetch(oldUrl);
        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status} saat download dari ${oldUrl}`
          );
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType =
          res.headers.get("content-type") || "application/octet-stream";

        // 2. Upload ke MinIO
        await minioClient.putObject(
          MINIO_BUCKET,
          key,
          buffer,
          buffer.length,
          { "Content-Type": contentType }
        );

        // 3. Update URL di MongoDB
        const newUrl = `${MINIO_PUBLIC_URL}/${key}`;
        await col.updateOne(
          { _id: doc._id },
          { $set: { [field]: newUrl } }
        );

        totalSuccess++;
        console.log(`  ✓ [${colName}] ID ${doc.id || doc._id} -> ${newUrl}`);
      } catch (err: any) {
        totalFailed++;
        console.error(
          `  ✗ [${colName}] Gagal ID ${doc.id || doc._id} (${oldUrl}): ${err.message}`
        );
      }
    }
  }

  console.log("\n=================================");
  console.log(`Selesai!`);
  console.log(`Berhasil migrasi: ${totalSuccess} gambar`);
  console.log(`Gagal migrasi   : ${totalFailed} gambar`);
  console.log("=================================");

  await mongoClient.close();
}

migrateImages().catch(console.error);
