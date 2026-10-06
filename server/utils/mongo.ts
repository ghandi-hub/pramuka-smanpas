import { MongoClient, type Db, ObjectId } from "mongodb";
import { randomUUID } from "node:crypto";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!clientPromise) {
    const config = useRuntimeConfig();
    const uri = config.mongodbUri || process.env.MONGODB_URI;

    if (!uri) {
      throw createError({
        statusCode: 500,
        statusMessage: "MongoDB URI configuration is missing.",
      });
    }

    const mongoClient = new MongoClient(uri);
    clientPromise = mongoClient.connect().then((connectedClient) => {
      client = connectedClient;
      return connectedClient;
    });
  }

  return clientPromise;
}

export async function getDb(dbName?: string): Promise<Db> {
  const mongoClient = await getMongoClient();
  const config = useRuntimeConfig();
  const name =
    dbName ||
    config.mongodbDatabase ||
    process.env.MONGODB_DATABASE ||
    "pramuka_db";
  return mongoClient.db(name);
}

export function transformDocument<T = any>(doc: any): T {
  if (!doc) return doc;

  if (Array.isArray(doc)) {
    return doc.map((item) => transformDocument(item)) as unknown as T;
  }

  if (typeof doc !== "object") return doc;

  const transformed: Record<string, any> = { ...doc };

  if (transformed._id !== undefined) {
    const strId =
      typeof transformed._id === "string"
        ? transformed._id
        : transformed._id?.toString();
    if (!transformed.id) {
      transformed.id = strId;
    } else {
      transformed.id = String(transformed.id);
    }
  } else if (transformed.id !== undefined) {
    transformed.id = String(transformed.id);
  }

  return transformed as T;
}

export function prepareDocumentForInsert<T extends Record<string, any>>(
  doc: T,
): T & { id: string; _id: string; created_at: string; updated_at: string } {
  const generatedId = doc.id || doc._id?.toString() || randomUUID();
  const now = new Date().toISOString();

  return {
    ...doc,
    id: String(generatedId),
    _id: String(generatedId),
    created_at: doc.created_at || now,
    updated_at: doc.updated_at || now,
  };
}

export function toMongoIdFilter(id: string) {
  const stringId = String(id);
  const filters: Array<Record<string, any>> = [
    { id: stringId },
    { _id: stringId },
  ];

  if (ObjectId.isValid(stringId) && String(new ObjectId(stringId)) === stringId) {
    filters.push({ _id: new ObjectId(stringId) });
  }

  return { $or: filters };
}
