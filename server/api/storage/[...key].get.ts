import { getMinioClient, getMinioConfig } from "~~/server/utils/minio";

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, "key");
  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: "Storage key is required",
    });
  }

  const client = getMinioClient();
  const config = getMinioConfig();

  // Prevent directory traversal
  let cleanKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
  if (cleanKey.startsWith(`${config.bucket}/`)) {
    cleanKey = cleanKey.slice(`${config.bucket}/`.length);
  }

  try {
    const dataStream = await client.getObject(config.bucket, cleanKey);
    const stat = await client.statObject(config.bucket, cleanKey);

    setResponseHeaders(event, {
      "Content-Type": stat.metaData?.["content-type"] || "image/jpeg",
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    return sendStream(event, dataStream);
  } catch (err: any) {
    if (err.code === "NoSuchKey" || err.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "File tidak ditemukan",
      });
    }
    console.error("Storage streaming error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil file dari storage",
    });
  }
});
