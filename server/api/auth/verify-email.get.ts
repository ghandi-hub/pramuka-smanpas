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

  // Validate expiration
  if (!verification.expires_at || new Date(verification.expires_at) < new Date()) {
    await verificationsCollection.deleteOne(toMongoIdFilter(verificationId));
    throw createError({
      statusCode: 400,
      statusMessage: "Token sudah kedaluwarsa.",
    });
  }

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

  await verificationsCollection.deleteOne(toMongoIdFilter(verificationId));

  return {
    message: "Email berhasil diverifikasi. Silakan login.",
  };
});
