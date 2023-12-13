import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookNotes } from "lib/server/bookNotes"
import BookNotesIndex from "app/books/[bookSlug]/notes/components/BookNotesIndex"
import Sort from "enums/Sort"
import BookNoteType from "enums/BookNoteType"

export const dynamic = "force-dynamic"

export default async function BookNotesPage({ params }) {
  const currentUserProfile = await getCurrentUserProfile()

  const { bookSlug } = params

  const book: any = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!book) notFound()

  book.bookNotes = await getBookNotes({
    bookId: book.id,
    noteTypes: [BookNoteType.JournalEntry],
    requireText: true,
    currentUserProfile,
    sort: Sort.Popular,
  })

  return <BookNotesIndex book={book} currentUserProfile={currentUserProfile} />
}
