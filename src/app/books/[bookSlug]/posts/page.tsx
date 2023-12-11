import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookNotes } from "lib/server/bookNotes"
import BookPostsIndex from "app/books/[bookSlug]/posts/components/BookPostsIndex"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"
import Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function BookPostsPage({ params }) {
  const currentUserProfile = await getCurrentUserProfile()

  const { bookSlug } = params

  const book = (await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })) as Book

  console.log(book)

  if (!book) notFound()

  book.bookPosts = await getBookNotes({
    bookId: book.id,
    noteTypes: [BookNoteType.LinkPost, BookNoteType.TextPost],
    sort: Sort.Popular,
    currentUserProfile,
  })

  return <BookPostsIndex book={book} currentUserProfile={currentUserProfile} />
}
