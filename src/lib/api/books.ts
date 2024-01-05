import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { uploadCoverImage } from "lib/server/supabaseStorage"
import { generateUniqueSlug, fetchImageAsBlob } from "lib/helpers/general"
import { reportToSentry } from "lib/sentry"
import CoverSize from "enums/CoverSize"
import type Book from "types/Book"

async function findOrCreateBook(_book: Book) {
  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId: _book.openLibraryWorkId,
    },
  })

  if (existingBook) return existingBook

  const {
    title,
    authorName,
    coverImageUrl,
    openLibraryWorkId,
    editionsCount,
    firstPublishedYear,
    isTranslated,
    originalTitle,
  } = _book

  const slug = await generateUniqueSlug(`${title} ${authorName}`, "book")

  const createdBook = await prisma.book.create({
    data: {
      slug,
      title,
      authorName,
      coverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear: Number(firstPublishedYear),
      isTranslated,
      originalTitle,
    },
  })

  // fetch covers and upload to supabase storage
  if (coverImageUrl) {
    const baseOptions = {
      bookId: createdBook.id,
      bookSlug: slug,
      extension: coverImageUrl.split(".").pop(),
    }

    const { md: olThumbnailUrl, lg: olLargeUrl } = OpenLibrary.getCoverUrlsBySize(coverImageUrl)

    try {
      const { blob: thumbnailBlob, mimeType: thumbnailMimeType } = await fetchImageAsBlob(
        olThumbnailUrl,
      )

      const thumbnailOptions = {
        ...baseOptions,
        size: CoverSize.Md,
        mimeType: thumbnailMimeType,
      }

      const thumbnailUrl = await uploadCoverImage(thumbnailBlob, thumbnailOptions)

      const { blob: largeBlob, mimeType: largeMimeType } = await fetchImageAsBlob(olLargeUrl)

      const largeOptions = {
        ...baseOptions,
        size: CoverSize.Lg,
        mimeType: largeMimeType,
      }

      const largeUrl = await uploadCoverImage(largeBlob, largeOptions)

      await prisma.book.update({
        where: {
          id: createdBook.id,
        },
        data: {
          coverImageUrl: largeUrl,
          coverImageThumbnailUrl: thumbnailUrl,
          openLibraryCoverImageUrl: coverImageUrl,
        },
      })
    } catch (error) {
      reportToSentry(error, { coverImageUrl })
    }
  }

  return createdBook
}

export { findOrCreateBook }
