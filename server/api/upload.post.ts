import { uploadToMinio } from '~~/server/utils/minio'

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event)

  const file = body?.find(item => item.name === 'file')

  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File tidak ditemukan'
    })
  }

  if (!file.type || !file.type.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File harus berupa gambar'
    })
  }

  try {
    const { url, key } = await uploadToMinio(
      file.data,
      file.filename || 'image.png',
      file.type
    )

    return {
      url,
      public_id: key
    }
  } catch (error: any) {
    console.error('MinIO upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal mengunggah file. Silakan coba lagi.',
      fatal: false
    })
  }
})
