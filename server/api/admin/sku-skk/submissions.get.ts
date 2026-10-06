import type { H3Event } from "h3";
import { getDb, transformDocument } from "~~/server/utils/mongo";

type SubmissionType = "all" | "sku" | "skk";
type SubmissionStatus = "all" | "pending" | "verified" | "rejected";

const TYPE_VALUES: SubmissionType[] = ["all", "sku", "skk"];
const STATUS_VALUES: SubmissionStatus[] = ["all", "pending", "verified", "rejected"];

function requireAdmin(event: H3Event) {
  const auth = event.context.auth as { id?: string; role?: string } | undefined;
  if (!auth || auth.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required",
    });
  }
  return auth;
}

function asId(value: any): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "object" && typeof value.toString === "function") {
    return value.toString();
  }
  return String(value);
}

async function buildMemberMap(db: any, userIds: string[]) {
  const map = new Map<string, { member_name: string | null; member_email: string | null }>();
  if (!userIds.length) return map;

  const [users, profiles] = await Promise.all([
    db.collection("users").find({ $or: [{ id: { $in: userIds } }, { _id: { $in: userIds } }] }).toArray(),
    db.collection("profiles").find({ $or: [{ id: { $in: userIds } }, { _id: { $in: userIds } }] }).toArray(),
  ]);

  for (const user of users) {
    const key = asId(user.id) ?? asId(user._id);
    if (!key) continue;
    map.set(key, {
      member_name: null,
      member_email: user.email ?? null,
    });
  }

  for (const profile of profiles) {
    const key = asId(profile.id) ?? asId(profile._id);
    if (!key) continue;
    const existing = map.get(key);
    map.set(key, {
      member_name: profile.name ?? existing?.member_name ?? null,
      member_email: profile.email ?? existing?.member_email ?? null,
    });
  }

  return map;
}

async function buildSkuItemMap(db: any, itemIds: string[]) {
  const map = new Map<string, { point_number: any; title: any; level: any }>();
  if (!itemIds.length) return map;

  const items = await db
    .collection("sku_items")
    .find({ $or: [{ id: { $in: itemIds } }, { _id: { $in: itemIds } }] })
    .toArray();

  for (const item of items) {
    const payload = {
      point_number: item.point_number ?? null,
      title: item.title ?? null,
      level: item.level ?? null,
    };
    const id = asId(item.id);
    const _id = asId(item._id);
    if (id) map.set(id, payload);
    if (_id) map.set(_id, payload);
  }

  return map;
}

async function buildSkkItemMap(db: any, itemIds: string[]) {
  const map = new Map<string, { name: any; category: any; field: any }>();
  if (!itemIds.length) return map;

  const items = await db
    .collection("skk_items")
    .find({ $or: [{ id: { $in: itemIds } }, { _id: { $in: itemIds } }] })
    .toArray();

  for (const item of items) {
    const payload = {
      name: item.name ?? null,
      category: item.category ?? null,
      field: item.field ?? null,
    };
    const id = asId(item.id);
    const _id = asId(item._id);
    if (id) map.set(id, payload);
    if (_id) map.set(_id, payload);
  }

  return map;
}

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const query = getQuery(event);
  const type = String(query.type ?? "all") as SubmissionType;
  const status = String(query.status ?? "all") as SubmissionStatus;

  if (!TYPE_VALUES.includes(type)) {
    throw createError({ statusCode: 400, statusMessage: "Parameter type tidak valid" });
  }
  if (!STATUS_VALUES.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: "Parameter status tidak valid" });
  }

  const db = await getDb();

  const statusFilter = status === "all" ? {} : { status };

  const tasks: Array<Promise<any[]>> = [];
  if (type === "all" || type === "sku") {
    tasks.push(
      db.collection("sku_progress").find(statusFilter).toArray().then((docs) => docs.map((d) => ({ ...d, __type: "sku" }))),
    );
  }
  if (type === "all" || type === "skk") {
    tasks.push(
      db.collection("skk_progress").find(statusFilter).toArray().then((docs) => docs.map((d) => ({ ...d, __type: "skk" }))),
    );
  }

  const results = (await Promise.all(tasks)).flat();

  const userIds = Array.from(
    new Set(results.map((doc) => asId(doc.user_id)).filter((v): v is string => !!v)),
  );
  const skuIds = Array.from(
    new Set(
      results
        .filter((doc) => doc.__type === "sku")
        .map((doc) => asId(doc.point_id))
        .filter((v): v is string => !!v),
    ),
  );
  const skkIds = Array.from(
    new Set(
      results
        .filter((doc) => doc.__type === "skk")
        .map((doc) => asId(doc.skk_id))
        .filter((v): v is string => !!v),
    ),
  );

  const [memberMap, skuItemMap, skkItemMap] = await Promise.all([
    buildMemberMap(db, userIds),
    buildSkuItemMap(db, skuIds),
    buildSkkItemMap(db, skkIds),
  ]);

  const submissions = results.map((doc) => {
    const submissionType = doc.__type;
    delete doc.__type;

    const transformed = transformDocument<any>(doc);
    const userId = asId(transformed.user_id);
    const member = userId ? memberMap.get(userId) : undefined;
    transformed.member_name = member?.member_name ?? null;
    transformed.member_email = member?.member_email ?? null;

    transformed.type = submissionType;

    if (submissionType === "sku") {
      const itemId = asId(transformed.point_id);
      transformed.item = itemId ? skuItemMap.get(itemId) ?? null : null;
    } else {
      const itemId = asId(transformed.skk_id);
      transformed.item = itemId ? skkItemMap.get(itemId) ?? null : null;
    }

    return transformed;
  });

  submissions.sort((a, b) => {
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return bTime - aTime;
  });

  return submissions;
});