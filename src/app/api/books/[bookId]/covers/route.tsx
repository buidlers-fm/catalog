import { NextResponse } from "next/server"
import sharp from "sharp"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { uploadCoverImage } from "lib/server/supabaseStorage"
import { maxBookCoverSizes } from "lib/constants/images"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile } = params
  const { bookId } = routeParams

  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
    },
  })

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  const { slug: bookSlug } = book

  const { coverImageUrl } = reqJson

  // download image
  const coverImageRes = await fetch(coverImageUrl)
  const coverImageArrayBuffer = await coverImageRes.arrayBuffer()

  const baseOptions = {
    bookId,
    bookSlug,
    extension: "png",
    mimeType: "image/png",
    replace: true,
  }

  // resize into 2 images
  const resizedLargeBuffer = await sharp(coverImageArrayBuffer)
    .resize({
      width: maxBookCoverSizes.full.width,
      height: maxBookCoverSizes.full.height,
      fit: "inside",
    })
    .png()
    .toBuffer()

  const largeOptions = {
    ...baseOptions,
    size: "lg",
  }

  const uploadLargeImagePromise = uploadCoverImage(resizedLargeBuffer, largeOptions)

  const resizedThumbnailBuffer = await sharp(coverImageArrayBuffer)
    .resize({
      width: maxBookCoverSizes.thumbnail.width,
      height: maxBookCoverSizes.thumbnail.height,
      fit: "inside",
    })
    .png()
    .toBuffer()

  const thumbnailOptions = {
    ...baseOptions,
    size: "md",
  }

  const uploadThumbnailPromise = uploadCoverImage(resizedThumbnailBuffer, thumbnailOptions)

  // upload to storage
  const [largeImageUrl, thumbnailImageUrl] = await Promise.all([
    uploadLargeImagePromise,
    uploadThumbnailPromise,
  ])

  // update book
  const isFromOpenLibrary = !!coverImageUrl.match(/openlibrary/)

  const updatedBook = await prisma.book.update({
    where: {
      id: bookId,
    },
    data: {
      coverImageUrl: largeImageUrl,
      coverImageThumbnailUrl: thumbnailImageUrl,
      openLibraryCoverImageUrl: isFromOpenLibrary ? coverImageUrl : undefined,
      edited: true,
    },
  })

  const afterData = {
    ...updatedBook,
    coverImageSourceUrl: coverImageUrl,
  }

  const editedFields = ["coverImageUrl", "coverImageThumbnailUrl"]
  if (isFromOpenLibrary) {
    editedFields.push("openLibraryCoverImageUrl")
  }

  // create edit logs
  await prisma.editLog.create({
    data: {
      editorId: currentUserProfile.id,
      editedObjectId: bookId,
      editedObjectType: EditedObjectType.Book,
      editType: EditType.Cover,
      beforeJson: book,
      afterJson: afterData,
      editedFields,
    },
  })

  const resBody = humps.decamelizeKeys(updatedBook)

  return NextResponse.json(resBody, { status: 200 })
})
