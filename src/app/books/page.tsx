import OpenLibrary from "lib/openlibrary"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function BookPageByQuery({ searchParams }) {
  const { openlibraryWorkId } = searchParams

  if (!openlibraryWorkId) throw new Error("openlibraryWorkId must be included")

  const openlibraryBook: Book = await OpenLibrary.getFullBook(openlibraryWorkId)

  return <BookPage book={openlibraryBook} />
}
