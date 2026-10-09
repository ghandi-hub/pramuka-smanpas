import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGODB_URI not found in environment.");
  process.exit(1);
}

const dataPath = resolve(process.cwd(), "scripts/skk-penegak-data.json");
const rawData = readFileSync(dataPath, "utf-8");
const items = JSON.parse(rawData);

console.log(`Loaded ${items.length} SKK items from ${dataPath}`);

const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db("pramuka_db");
    const collection = db.collection("skk_items");

    const countBefore = await collection.countDocuments();
    console.log(`Current skk_items count in DB: ${countBefore}`);

    // Valid IDs
    const validIds = items.map((i: any) => i.id);

    // Upsert all 81 official Penegak items
    const bulkOps = items.map((item: any) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: item },
        upsert: true,
      },
    }));

    const bulkResult = await collection.bulkWrite(bulkOps);
    console.log("Bulk write result:", {
      matchedCount: bulkResult.matchedCount,
      modifiedCount: bulkResult.modifiedCount,
      upsertedCount: bulkResult.upsertedCount,
    });

    // Clean up any items that are NOT in the official Penegak list
    const deleteResult = await collection.deleteMany({
      id: { $nin: validIds },
    });
    console.log(`Removed obsolete / non-Penegak items: ${deleteResult.deletedCount}`);

    const countAfter = await collection.countDocuments();
    console.log(`Final skk_items count in DB: ${countAfter}`);

    // Verify per color
    const colors = ["kuning", "merah", "putih", "hijau", "biru"];
    for (const c of colors) {
      const cCount = await collection.countDocuments({ color_code: c });
      console.log(`- Bidang ${c}: ${cCount}`);
    }

    const mandatoryCount = await collection.countDocuments({ is_mandatory: true });
    console.log(`- Mandatory (TKK Wajib): ${mandatoryCount}`);

    console.log("\nSync SKK Penegak completed successfully!");
  } catch (error) {
    console.error("Database sync failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
