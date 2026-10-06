import { getDb } from "~~/server/utils/mongo";

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, "refresh_token");

  if (refreshToken) {
    const db = await getDb();
    await db.collection("refresh_tokens").deleteMany({ token: refreshToken });
  }

  deleteCookie(event, "refresh_token");
  deleteCookie(event, "auth_token");

  return {
    message: "Logout berhasil",
  };
});
