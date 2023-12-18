import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import BookNotesIndex from "app/books/[bookSlug]/notes/components/BookNotesIndex"

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

  return <BookNotesIndex book={book} currentUserProfile={currentUserProfile} />
}
