import { StorageClient } from "@supabase/storage-js"
import { v4 as uuidv4 } from "uuid"

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

async function uploadCoverImage(coverImageBlob, options) {
  const { bookId, bookSlug, size, mimeType, extension } = options
  const fileDir = `books/covers/${bookId}/${size}`
  const filename = `${bookSlug}-${size}.${extension}`
  const filePath = `${fileDir}/${filename}`

  const { error: coverImageUploadError } = await storageClient
    .from("assets")
    .upload(filePath, coverImageBlob, { contentType: mimeType })

  if (coverImageUploadError)
    throw new Error(`Error uploading cover image: ${coverImageUploadError.message}`)

  return `${storageBucketPath}/${filePath}`
}

export { storageBucketPath, uploadAvatar, deleteAvatar, uploadCoverImage }
