import { comparePassword } from "~~/server/utils/hash";
import { generateRandomToken } from "~~/server/utils/token";
import { signToken } from "~~/server/utils/jwt";
import { getDb, prepareDocumentForInsert, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email dan password wajib diisi.",
    });
  }

  const db = await getDb();
  const normalizedEmail = String(email).toLowerCase().trim();

  // 1. Find user
  const user = await db
    .collection("users")
    .findOne({ email: normalizedEmail });

  if (!user || !user.password_hash) {
    throw createError({
      statusCode: 401,
      statusMessage: "Email atau password salah.",
    });
  }

  // 2. Verify password
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: "Email atau password salah.",
    });
  }

  // 3. Reject if not verified
  if (!user.email_verified) {
    throw createError({
      statusCode: 403,
      statusMessage: "Email belum diverifikasi. Silakan cek kotak masuk Anda.",
    });
  }

  // 4. Load profile role
  const userId = String(user.id || user._id);
  const profile = await db
    .collection("profiles")
    .findOne(toMongoIdFilter(userId));

  if (!profile) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memuat profil pengguna.",
    });
  }

  // 5. Generate Access Token (short-lived)
  const accessToken = signToken(
    {
      id: userId,
      role: profile.role,
    },
    "1h",
  );

  // 6. Generate Refresh Token (long-lived)
  const refreshToken = generateRandomToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const tokenDoc = prepareDocumentForInsert({
    user_id: userId,
    token: refreshToken,
    expires_at: expiresAt.toISOString(),
  });
  await db.collection("refresh_tokens").insertOne(tokenDoc);

  setCookie(event, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  return {
    token: accessToken,
    user: {
      id: userId,
      name: profile.name,
      email: user.email,
      avatar_url: profile.avatar_url,
      role: profile.role,
    },
  };
});
