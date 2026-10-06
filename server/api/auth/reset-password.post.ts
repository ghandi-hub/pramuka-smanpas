import { hashPassword } from "~~/server/utils/hash";
import { getDb, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token, password } = body;

  if (!token || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token dan password baru wajib diisi.",
    });
  }

  const db = await getDb();
  const resetsCollection = db.collection("password_resets");

  // 1. Find token
  const reset = await resetsCollection.findOne({ token: String(token) });

  if (!reset) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }

  const resetId = String(reset.id || reset._id);

  // 2. Validate expiration
  if (new Date(reset.expires_at) < new Date()) {
    await resetsCollection.deleteOne(toMongoIdFilter(resetId));
    throw createError({
      statusCode: 400,
      statusMessage: "Token sudah kedaluwarsa.",
    });
  }

  // 3. Hash new password
  const passwordHash = await hashPassword(password);

  // 4. Update user
  const userFilter = toMongoIdFilter(String(reset.user_id));
  const updateResult = await db.collection("users").updateOne(userFilter, {
    $set: {
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    },
  });

  if (updateResult.matchedCount === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengatur ulang password.",
    });
  }

  // 5. Delete token
  await resetsCollection.deleteOne(toMongoIdFilter(resetId));

  return {
    message: "Password berhasil diatur ulang. Silakan login.",
  };
});
