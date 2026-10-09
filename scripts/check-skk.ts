import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pramuka_db";
const client = new MongoClient(MONGO_URI);

async function main() {
  await client.connect();
  const db = client.db(process.env.MONGODB_DATABASE || "pramuka_db");
  const count = await db.collection("skk_items").countDocuments();
  console.log("Current count in skk_items:", count);
  const sample = await db.collection("skk_items").find().limit(2).toArray();
  console.log("Sample:", JSON.stringify(sample, null, 2));
  await client.close();
}

main().catch(console.error);
