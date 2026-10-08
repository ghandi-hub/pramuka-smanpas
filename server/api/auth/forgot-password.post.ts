import { sendMail } from "~~/server/utils/mailer";
import { generateRandomToken } from "~~/server/utils/token";
import { getDb, prepareDocumentForInsert } from "~~/server/utils/mongo";
import { checkRateLimit } from "~~/server/utils/rateLimit";

export default defineEventHandler(async (event) => {
  checkRateLimit(event, {
    key: "forgot-password",
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Permintaan reset password terlalu sering. Silakan coba lagi dalam 15 menit.",
  });

  const body = await readBody(event);
  const { email } = body;
  const config = useRuntimeConfig();

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email wajib diisi.",
    });
  }

  const db = await getDb();
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await db
    .collection("users")
    .findOne({ email: normalizedEmail });

  if (!user) {
    // Silently return success to avoid email enumeration
    return {
      message: "Jika email terdaftar, instruksi reset password telah dikirim.",
    };
  }

  const userId = String(user.id || user._id);

  // Invalidate previous tokens
  await db.collection("password_resets").deleteMany({ user_id: userId });

  const token = generateRandomToken();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  const resetDoc = prepareDocumentForInsert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });
  await db.collection("password_resets").insertOne(resetDoc);

  const resetLink = `${config.public.siteUrl}/auth/reset-password?token=${token}`;
  const html = `
        <h1>Reset Password</h1>
        <p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p>
        <p>Silakan klik tautan di bawah ini untuk mengatur ulang password Anda:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Tautan ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
    `;

  await sendMail(normalizedEmail, "Reset Password - Pramuka SMAN 1 Pasawahan", html);

  return {
    message: "Instruksi reset password telah dikirim ke email Anda.",
  };
});
