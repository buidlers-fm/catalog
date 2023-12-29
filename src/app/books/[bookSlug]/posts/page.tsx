import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import BookPostsIndex from "app/books/[bookSlug]/posts/components/BookPostsIndex"
import Book from "types/Book"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book.posts",
    params,
  })
}

export default async function BookPostsPage({ params }) {
  const currentUserProfile = await getCurrentUserProfile()

  const { bookSlug } = params

  const book = (await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })) as Book

  if (!book) notFound()

  return <BookPostsIndex book={book} currentUserProfile={currentUserProfile} />
}
