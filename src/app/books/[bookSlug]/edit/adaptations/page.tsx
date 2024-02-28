import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EditBookAdaptations from "app/books/[bookSlug]/edit/components/EditBookAdaptations"
import type Book from "types/Book"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book.edit",
    params,
  })
}

export default async function EditBookAdaptationsPage({ params }) {
  const { bookSlug } = params

  await getCurrentUserProfile({ requireSignedIn: true, redirectPath: `/books/${bookSlug}` })

  const book = (await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
    include: {
      adaptations: {
        orderBy: {
          year: "desc",
        },
      },
    },
  })) as Book

  if (!book) notFound()

  return <EditBookAdaptations book={book} />
}
