export const IMAGE_MIME_TYPE = ["image/png", "image/jpg", "image/jpeg", "image/gif"]
export const MAX_FILE_SIZE = 4 * 1000 * 1000

export const createTransformedFileItemObj = (file: Blob) => ({
  file,
  uploadedFileType: file.type,
  fileExtension: file.name.split(".").pop(),
})
