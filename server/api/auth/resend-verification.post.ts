import { sendMail } from "~~/server/utils/mailer";
import { generateRandomToken } from "~~/server/utils/token";
import { getDb, prepareDocumentForInsert, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, token: oldToken } = body;
  const config = useRuntimeConfig();

  if (!email && !oldToken) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email atau token wajib diisi.",
    });
  }

  const db = await getDb();
  let userEmail = email ? String(email).toLowerCase().trim() : null;
  let userId: string | null = null;

  // 1. Find user via old token if provided
  if (oldToken) {
    const verification = await db
      .collection("email_verifications")
      .findOne({ token: String(oldToken) });

    if (verification?.user_id) {
      userId = String(verification.user_id);
      const user = await db.collection("users").findOne(toMongoIdFilter(userId));
      if (user?.email) {
        userEmail = user.email;
      }
    }
  }

  // Find user via email if user not found yet
  if (!userId && userEmail) {
    const user = await db
      .collection("users")
      .findOne({ email: userEmail });

    if (user) {
      userId = String(user.id || user._id);
      userEmail = user.email;
    }
  }

  if (!userId || !userEmail) {
    // Silently return success to avoid email enumeration
    return {
      message: "Jika akun terdaftar, instruksi verifikasi telah dikirim.",
    };
  }

  // 2. Check if already verified
  const userData = await db.collection("users").findOne(toMongoIdFilter(userId));
  if (userData?.email_verified) {
    return { message: "Email sudah diverifikasi." };
  }

  // 3. Delete old tokens
  await db.collection("email_verifications").deleteMany({ user_id: userId });

  // 4. Generate new token
  const newToken = generateRandomToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const verificationDoc = prepareDocumentForInsert({
    user_id: userId,
    token: newToken,
    expires_at: expiresAt,
  });
  await db.collection("email_verifications").insertOne(verificationDoc);

  // 5. Send email
  const verificationLink = `${config.public.siteUrl}/auth/verify-email?token=${newToken}`;
  const html = `
        <h1>Verifikasi Email Anda</h1>
        <p>Silakan klik tautan di bawah ini untuk memverifikasi email Anda:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>Tautan ini akan kedaluwarsa dalam 24 jam.</p>
    `;

  await sendMail(userEmail, "Verifikasi Email - Pramuka SMAN 1 Pasawahan", html);

  return {
    message: "Instruksi verifikasi telah dikirim ke email Anda.",
  };
});
