import { MongoClient } from "mongodb";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/pramuka_db";
const DB_NAME = process.env.MONGODB_DATABASE || "pramuka_db";
const PUBLIC_BASE = "https://s3.codexlab.my.id/pramuka";

const targets = [
  { collection: "activities", field: "cover_image" },
  { collection: "galleries", field: "image_url" },
  { collection: "organization_members", field: "photo" },
  { collection: "twibbon_campaigns", field: "frame_url" },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`Mengubah URL database ke: ${PUBLIC_BASE}/...`);

  let totalUpdated = 0;

  for (const { collection: colName, field } of targets) {
    const col = db.collection(colName);
    const docs = await col.find({ [field]: { $exists: true, $ne: null } }).toArray();
    let count = 0;

    for (const doc of docs) {
      const oldUrl = doc[field];
      if (typeof oldUrl !== "string" || !oldUrl) continue;

      let key = "";
      if (oldUrl.includes("/pramuka/")) {
        const idx = oldUrl.indexOf("/pramuka/");
        key = oldUrl.slice(idx + "/pramuka/".length);
      } else if (oldUrl.startsWith("/api/storage/")) {
        key = oldUrl.slice("/api/storage/".length);
      } else if (oldUrl.includes("/uploads/")) {
        const idx = oldUrl.indexOf("/uploads/");
        key = oldUrl.slice(idx + 1); // "uploads/..."
      }

      if (key) {
        key = key.replace(/^\/+/, "");
        const newUrl = `${PUBLIC_BASE}/${key}`;
        if (oldUrl !== newUrl) {
          await col.updateOne({ _id: doc._id }, { $set: { [field]: newUrl } });
          count++;
          totalUpdated++;
        }
      }
    }

    console.log(`[${colName}] ${count} dokumen diperbarui.`);
  }

  await client.close();
  console.log(`\nTotal ${totalUpdated} URL gambar berhasil diperbarui ke ${PUBLIC_BASE}/...`);
}

main().catch(console.error);
