import { randomUUID } from "node:crypto";
import { hashPassword } from "~~/server/utils/hash";
import { sendMail } from "~~/server/utils/mailer";
import { generateRandomToken } from "~~/server/utils/token";
import { verifyToken } from "~~/server/utils/jwt";
import { getDb, prepareDocumentForInsert, toMongoIdFilter } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password, role, avatar_url } = body;
  const config = useRuntimeConfig();

  // 1. Validate
  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nama, email, dan password wajib diisi.",
    });
  }

  // --- Authorization Check ---
  const authHeader = getHeader(event, "Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const authToken = authHeader.split(" ")[1];
  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Token tidak ditemukan",
    });
  }

  try {
    const decoded = verifyToken(authToken) as any;
    if (decoded.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Hanya admin yang dapat menambahkan user",
      });
    }
  } catch (err: any) {
    if (err.statusCode === 403) throw err;
    throw createError({
      statusCode: 401,
      statusMessage: "Token tidak valid",
    });
  }
  // ---------------------------

  const db = await getDb();
  const normalizedEmail = String(email).toLowerCase().trim();

  // Check if user already exists
  const existingUser = await db
    .collection("users")
    .findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email sudah terdaftar.",
    });
  }

  let createdUserId: string | null = null;

  try {
    // 2. Hash password
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    createdUserId = userId;
    const now = new Date().toISOString();

    // 3. Insert into users
    const userDoc = {
      id: userId,
      _id: userId,
      email: normalizedEmail,
      password_hash: passwordHash,
      email_verified: false,
      created_at: now,
      updated_at: now,
    };
    await db.collection("users").insertOne(userDoc);

    // 4. Insert into profiles (using same ID)
    const profileDoc = {
      id: userId,
      _id: userId,
      name: String(name).trim(),
      email: normalizedEmail,
      role: role || "admin",
      avatar_url: avatar_url || null,
      created_at: now,
      updated_at: now,
    };
    await db.collection("profiles").insertOne(profileDoc);

    // 5. Generate verification token
    const verificationToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 6. Store token
    const verificationDoc = prepareDocumentForInsert({
      user_id: userId,
      token: verificationToken,
      expires_at: expiresAt.toISOString(),
    });
    await db.collection("email_verifications").insertOne(verificationDoc);

    // 7. Send verification email
    const verificationLink = `${config.public.siteUrl}/auth/verify-email?token=${verificationToken}`;
    const html = `
          <h1>Verifikasi Email Anda</h1>
          <p>Halo ${name},</p>
          <p>Terima kasih telah mendaftar. Silakan klik tautan di bawah ini untuk memverifikasi email Anda:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>Tautan ini akan kedaluwarsa dalam 24 jam.</p>
      `;

    await sendMail(normalizedEmail, "Verifikasi Email - Pramuka SMAN 1 Pasawahan", html);

    return {
      message: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
    };
  } catch (error: any) {
    // ROLLBACK: If anything fails after user creation, cleanup created records
    if (createdUserId) {
      await Promise.all([
        db.collection("users").deleteOne(toMongoIdFilter(createdUserId)),
        db.collection("profiles").deleteOne(toMongoIdFilter(createdUserId)),
        db.collection("email_verifications").deleteMany({ user_id: createdUserId }),
      ]);
    }

    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Terjadi kesalahan saat pendaftaran.",
    });
  }
});
