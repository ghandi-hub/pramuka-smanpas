import sharp from 'sharp'
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
    let uploadBuffer: Buffer = file.data
    let uploadFilename = file.filename || 'image.png'
    let uploadMimeType = file.type

    if (file.type === 'image/svg+xml') {
      uploadFilename = file.filename || 'image.svg'
      uploadMimeType = 'image/svg+xml'
    } else {
      try {
        uploadBuffer = await sharp(file.data)
          .rotate()
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer()

        const baseName = (file.filename || 'image').replace(/\.[^/.]+$/, '') || 'image'
        uploadFilename = `${baseName}.webp`
        uploadMimeType = 'image/webp'
      } catch (sharpError: any) {
        console.error('Sharp optimization error:', sharpError)
        throw createError({
          statusCode: 422,
          statusMessage: 'Gagal memproses gambar. Format gambar tidak valid atau rusak.',
          fatal: false
        })
      }
    }

    const { url, key } = await uploadToMinio(
      uploadBuffer,
      uploadFilename,
      uploadMimeType
    )

    return {
      url,
      public_id: key
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('MinIO upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal mengunggah file. Silakan coba lagi.',
      fatal: false
    })
  }
})
