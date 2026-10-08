// Skrip migrasi sekali pakai (one-time migration) dari Supabase ke MongoDB
import { MongoClient } from "mongodb";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pramuka_db";
const DB_NAME = process.env.MONGODB_DATABASE || "pramuka_db";

const TABLES = [
  "activities",
  "galleries",
  "organization_members",
  "abouts",
  "twibbon_campaigns",
  "contact_messages",
  "profiles",
  "users",
  "refresh_tokens",
  "email_verifications",
  "password_resets"
];

async function main() {
  console.log("Menghubungkan ke MongoDB...");
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  console.log("Terhubung ke database:", DB_NAME);

  const results: Record<string, { fetched: number; inserted: number }> = {};

  for (const table of TABLES) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
      const response = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`[SKIP] Tabel ${table}: HTTP ${response.status} ${response.statusText}`);
        continue;
      }

      const rows: any[] = await response.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        console.log(`[EMPTY] Tabel ${table}: 0 data`);
        results[table] = { fetched: 0, inserted: 0 };
        continue;
      }

      const collection = db.collection(table);
      let count = 0;

      for (const item of rows) {
        const id = String(item.id || item._id);
        const doc = {
          ...item,
          _id: id,
          id: id,
        };

        await collection.replaceOne({ _id: id as any }, doc as any, { upsert: true });
        count++;
      }

      console.log(`[OK] Tabel ${table}: ${count} data berhasil dimigrasi.`);
      results[table] = { fetched: rows.length, inserted: count };
    } catch (err: any) {
      console.error(`[ERROR] Gagal migrasi tabel ${table}:`, err.message);
    }
  }

  await client.close();
  console.log("\nRingkasan Migrasi:");
  console.table(results);
}

main().catch(console.error);
