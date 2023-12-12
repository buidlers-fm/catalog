import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import BookNotesIndex from "app/books/[bookSlug]/notes/components/BookNotesIndex"
import BookNoteType from "enums/BookNoteType"

export const dynamic = "force-dynamic"

export default async function BookNotesPage({ params }) {
  const currentUserProfile = await getCurrentUserProfile()

  const { bookSlug } = params

  console.log("bookSlug", bookSlug)

  const book = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
    include: {
      bookNotes: {
        where: {
          noteType: BookNoteType.JournalEntry,
          text: {
            not: null,
            notIn: [""],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          creator: true,
          book: true,
        },
      },
    },
  })

  if (!book) notFound()

  return <BookNotesIndex book={book} currentUserProfile={currentUserProfile} />
}