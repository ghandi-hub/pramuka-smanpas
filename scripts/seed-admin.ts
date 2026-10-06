import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pramuka_db";
const DB_NAME = process.env.MONGODB_DATABASE || "pramuka_db";

const email = process.argv[2] || "admin@pramuka.org";
const password = process.argv[3] || "Admin123!";
const name = process.argv[4] || "Administrator";

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db.collection("users").findOne({ email: normalizedEmail });

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  if (existing) {
    await db.collection("users").updateOne(
      { _id: existing._id },
      { $set: { password_hash: passwordHash, email_verified: true, updated_at: now } }
    );
    await db.collection("profiles").updateOne(
      { _id: existing._id },
      { $set: { name, role: "admin", updated_at: now } },
      { upsert: true }
    );
    console.log(`User ${normalizedEmail} sudah ada. Password dan profil admin berhasil diperbarui.`);
  } else {
    const id = randomUUID();
    await db.collection("users").insertOne({
      _id: id as any,
      id,
      email: normalizedEmail,
      password_hash: passwordHash,
      email_verified: true,
      created_at: now,
      updated_at: now,
    });
    await db.collection("profiles").insertOne({
      _id: id as any,
      id,
      name,
      email: normalizedEmail,
      role: "admin",
      avatar_url: null,
      created_at: now,
      updated_at: now,
    });
    console.log(`Admin baru berhasil dibuat!`);
  }

  console.log(`Email   : ${normalizedEmail}`);
  console.log(`Password: ${password}`);
  console.log(`Role    : admin`);

  await client.close();
}

seed().catch(console.error);
