import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EditBook from "app/books/[bookSlug]/edit/components/EditBook"
import type Book from "types/Book"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book.edit",
    params,
  })
}

export default async function EditBookPage({ params }) {
  const { bookSlug } = params

  await getCurrentUserProfile({ requireSignedIn: true })

  const book = (await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })) as Book

  if (!book) notFound()

  return <EditBook book={book} />
}
