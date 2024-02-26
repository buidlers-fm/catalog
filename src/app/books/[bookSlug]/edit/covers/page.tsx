import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EditBookCovers from "app/books/[bookSlug]/edit/components/EditBookCovers"
import type Book from "types/Book"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book.edit",
    params,
  })
}

export default async function EditBookCoversPage({ params }) {
  const { bookSlug } = params

  await getCurrentUserProfile({ requireSignedIn: true })

  const book = (await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })) as Book

  if (!book) notFound()

  return <EditBookCovers book={book} />
}
