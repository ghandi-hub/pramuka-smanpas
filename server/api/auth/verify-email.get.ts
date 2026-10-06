import { getDb, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const token = query.token as string;

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token tidak valid.",
    });
  }

  const db = await getDb();
  const verificationsCollection = db.collection("email_verifications");

  // 1. Find token
  const verification = await verificationsCollection.findOne({
    token: String(token),
  });

  if (!verification) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token tidak valid atau sudah digunakan.",
    });
  }

  const verificationId = String(verification.id || verification._id);

  // 2. Validate expiration
  if (new Date(verification.expires_at) < new Date()) {
    await verificationsCollection.deleteOne(toMongoIdFilter(verificationId));
    throw createError({
      statusCode: 400,
      statusMessage: "Token sudah kedaluwarsa.",
    });
  }

  // 3. Update user
  const userFilter = toMongoIdFilter(String(verification.user_id));
  const updateResult = await db.collection("users").updateOne(userFilter, {
    $set: {
      email_verified: true,
      updated_at: new Date().toISOString(),
    },
  });

  if (updateResult.matchedCount === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memverifikasi email.",
    });
  }

  // 4. Delete token
  await verificationsCollection.deleteOne(toMongoIdFilter(verificationId));

  return {
    message: "Email berhasil diverifikasi. Silakan login.",
  };
});
