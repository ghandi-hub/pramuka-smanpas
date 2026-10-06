import { signToken } from "~~/server/utils/jwt";
import { generateRandomToken } from "~~/server/utils/token";
import { getDb, prepareDocumentForInsert, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, "refresh_token");

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token tidak ditemukan",
    });
  }

  const db = await getDb();
  const tokensCollection = db.collection("refresh_tokens");

  // 1. Check token in database
  const tokenData = await tokensCollection.findOne({ token: refreshToken });

  if (!tokenData) {
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token tidak valid",
    });
  }

  // 2. Check expiration
  if (!tokenData.expires_at || new Date(tokenData.expires_at) < new Date()) {
    await tokensCollection.deleteOne({ token: refreshToken });
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token kedaluwarsa",
    });
  }

  // 3. Get user profile for payload
  const userId = String(tokenData.user_id);
  const profile = await db
    .collection("profiles")
    .findOne(toMongoIdFilter(userId));

  if (!profile) {
    throw createError({
      statusCode: 401,
      statusMessage: "User tidak ditemukan",
    });
  }

  // 4. Issue new access token
  const accessToken = signToken(
    {
      id: userId,
      role: profile.role,
    },
    "1h",
  );

  // 5. Rotate refresh token: invalidate old and generate new
  const newRefreshToken = generateRandomToken();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await tokensCollection.deleteOne({ token: refreshToken });
  await tokensCollection.insertOne(
    prepareDocumentForInsert({
      user_id: userId,
      token: newRefreshToken,
      expires_at: newExpiresAt,
    }),
  );

  setCookie(event, "refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: newExpiresAt,
  });

  return {
    token: accessToken,
  };
});
