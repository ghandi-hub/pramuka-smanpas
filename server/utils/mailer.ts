import nodemailer from "nodemailer";

export const getMailerConfig = () => {
  let runtimeConfig: Record<string, any> = {};
  try {
    runtimeConfig = useRuntimeConfig();
  } catch {}

  const host =
    process.env.EMAIL_SMTP_HOST ||
    (runtimeConfig.emailHost as string) ||
    "smtp.gmail.com";

  const portRaw =
    process.env.EMAIL_SMTP_PORT ||
    runtimeConfig.emailPort ||
    465;
  const port = Number(portRaw);

  const secureRaw =
    process.env.EMAIL_SMTP_SECURE ??
    runtimeConfig.emailSecure ??
    (port === 465);
  const secure = secureRaw === true || String(secureRaw) === "true";

  const user =
    process.env.EMAIL_SMTP_USER ||
    (runtimeConfig.emailUser as string) ||
    "";

  const pass =
    process.env.EMAIL_SMTP_PASS ||
    (runtimeConfig.emailPassword as string) ||
    "";

  return { host, port, secure, user, pass };
};

export const sendMail = async (to: string, subject: string, html: string) => {
  const config = getMailerConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const mailOptions = {
    from: `"Pramuka SMAN 1 Pasawahan" <${config.user}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Mailer error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengirim email.",
    });
  }
};
