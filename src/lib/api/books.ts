import prisma from "lib/prisma"
import { generateUniqueSlug } from "lib/helpers/general"
import type Book from "types/Book"

async function findOrCreateBook(_book: Book) {
  let book
  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId: _book.openLibraryWorkId,
    },
  })

  if (existingBook) {
    book = existingBook
  } else {
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

    const createdBook = await prisma.book.create({
      data: {
        slug: await generateUniqueSlug(`${title} ${authorName}`, "book"),
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

    book = createdBook
  }
  return book
}

export { findOrCreateBook }
