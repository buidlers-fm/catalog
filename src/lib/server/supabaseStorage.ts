import { StorageClient } from "@supabase/storage-js"
import { v4 as uuidv4 } from "uuid"
import cryptoRandomString from "crypto-random-string"
import { reportToSentry } from "lib/sentry"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const storageUrl = `${SUPABASE_URL}/storage/v1`
const storageBucketPath = `${storageUrl}/object/public/assets`
const storageClient = new StorageClient(storageUrl, {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
})

async function uploadAvatar(avatarBlob, options) {
  const { avatarMimeType, avatarExtension } = options
  const avatarUuid = uuidv4()
  const fileDir = "user_profiles/avatars"
  const filePath = `${fileDir}/${avatarUuid}.${avatarExtension}`

  const { error: avatarUploadError } = await storageClient
    .from("assets")
    .upload(filePath, avatarBlob, { contentType: avatarMimeType })

  if (avatarUploadError) throw new Error(`Error uploading avatar: ${avatarUploadError.message}`)

  return `${storageBucketPath}/${filePath}`
}

async function deleteAvatar(avatarUrl) {
  const filePath = avatarUrl.split("/assets/").pop()

  const { error: avatarDeleteError } = await storageClient.from("assets").remove([filePath])

  if (avatarDeleteError) throw new Error(`Error deleting avatar: ${avatarDeleteError.message}`)
}

async function uploadCoverImage(coverImageData, options) {
  const { bookId, bookSlug, size, mimeType, extension, replace = false } = options

  // add a nonce to the filename to prevent caching issues when cover has changed
  const nonce = cryptoRandomString({ length: 6 })

  const fileDir = `books/covers/${bookId}/${size}`
  const filename = `${bookSlug}-${size}-${nonce}.${extension}`
  const filePath = `${fileDir}/${filename}`
  const imageUrl = `${storageBucketPath}/${filePath}`

  const { error: coverImageUploadError } = await storageClient
    .from("assets")
    .upload(filePath, coverImageData, {
      contentType: mimeType,
      upsert: replace,
    })

  if (coverImageUploadError) {
    if (coverImageUploadError.message.match(/The resource already exists/)) {
      reportToSentry(new Error("Cover image already exists"), {
        imageUrl,
        options,
      })

      return imageUrl
    } else {
      throw new Error(`Error uploading cover image: ${coverImageUploadError.message}`)
    }
  }

  return imageUrl
}

async function uploadPersonImage(imageData, options) {
  const { personId, personSlug, mimeType, extension, replace = false } = options

  // add a nonce to the filename to prevent caching issues when cover has changed
  const nonce = cryptoRandomString({ length: 6 })

  const fileDir = `people/images/${personId}`
  const filename = `${personSlug}-${nonce}.${extension}`
  const filePath = `${fileDir}/${filename}`
  const imageUrl = `${storageBucketPath}/${filePath}`

  const { error: imageUploadError } = await storageClient
    .from("assets")
    .upload(filePath, imageData, {
      contentType: mimeType,
      upsert: replace,
    })

  if (imageUploadError) {
    if (imageUploadError.message.match(/The resource already exists/)) {
      reportToSentry(new Error("Image already exists"), {
        imageUrl,
        options,
      })

      return imageUrl
    } else {
      throw new Error(`Error uploading person image: ${imageUploadError.message}`)
    }
  }

  return imageUrl
}

export { storageBucketPath, uploadAvatar, deleteAvatar, uploadCoverImage, uploadPersonImage }
