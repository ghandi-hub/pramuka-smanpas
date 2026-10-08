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

  const tokenData = await tokensCollection.findOne({ token: refreshToken });

  if (!tokenData) {
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token tidak valid",
    });
  }

  // Check expiration
  if (!tokenData.expires_at || new Date(tokenData.expires_at) < new Date()) {
    await tokensCollection.deleteOne({ token: refreshToken });
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token kedaluwarsa",
    });
  }

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

  // Issue new access token
  const accessToken = signToken(
    {
      id: userId,
      role: profile.role,
    },
    "1h",
  );

  // Rotate refresh token
  const newRefreshToken = generateRandomToken();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await tokensCollection.deleteOne({ token: refreshToken });
  await tokensCollection.insertOne(
    prepareDocumentForInsert({
      user_id: userId,
      token: newRefreshToken,
      expires_at: newExpiresAt,
    }) as any,
  );

  const isSecure = getRequestURL(event).protocol === "https:";

  setCookie(event, "refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    expires: newExpiresAt,
  });

  return {
    token: accessToken,
  };
});
