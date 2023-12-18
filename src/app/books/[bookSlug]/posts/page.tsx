import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import BookPostsIndex from "app/books/[bookSlug]/posts/components/BookPostsIndex"
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

  return <BookPostsIndex book={book} currentUserProfile={currentUserProfile} />
}
