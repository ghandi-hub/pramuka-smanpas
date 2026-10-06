import { deleteFromMinio } from '~~/server/utils/minio'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imageUrl = body?.imageUrl || body?.url || body?.key || body?.public_id

  if (!imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL gambar tidak disertakan'
    })
  }

  try {
    await deleteFromMinio(imageUrl)
    return {
      success: true
    }
  } catch (error: any) {
    console.error('MinIO delete error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal menghapus gambar'
    })
  }
})
