import { PrismaClient } from "@prisma/client"
import OpenLibrary from "lib/openlibrary"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function BookPageBySlug({ params }: any) {
  const { bookSlug } = params

  const book = await prisma.book.findUnique({
    where: {
      slug: bookSlug,
    },
  })

  if (!book) throw new Error("Book not found")

  const workId = book.openlibraryWorkId!
  const openlibraryBook: Book = await OpenLibrary.getFullBook(workId)

  return <BookPage book={openlibraryBook} />
}
