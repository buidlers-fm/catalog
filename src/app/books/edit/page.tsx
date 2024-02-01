import { redirect, notFound } from "next/navigation"
import humps from "humps"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { findOrCreateBook } from "lib/api/books"
import { reportToSentry } from "lib/sentry"
import { getBookEditLink } from "lib/helpers/general"

export const dynamic = "force-dynamic"

export default async function BookPageByQuery({ searchParams }) {
  const { openLibraryWorkId, openLibraryEditionId: openLibraryBestEditionId } =
    humps.camelizeKeys(searchParams)

  if (!openLibraryWorkId) notFound()

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId,
    },
  })

  if (existingBook) redirect(getBookEditLink(existingBook.slug))

  let openLibraryBook: any = {}
  try {
    openLibraryBook = await OpenLibrary.getFullBook(openLibraryWorkId, openLibraryBestEditionId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryWorkId, openLibraryBestEditionId })
    notFound()
  }

  const book = await findOrCreateBook(openLibraryBook, { processCoverImage: false })

  redirect(getBookEditLink(book.slug))
}
