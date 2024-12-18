import { redirect, notFound } from "next/navigation"
import humps from "humps"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { reportToSentry } from "lib/sentry"
import { getBookLink } from "lib/helpers/general"
import BookPage from "app/books/components/BookPage"
import RemountOnPathChange from "app/components/RemountOnPathChange"
import ErrorPage from "app/error"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { openLibraryWorkId, openLibraryEditionId: openLibraryBestEditionId } =
    humps.camelizeKeys(searchParams)

  if (!openLibraryWorkId) return {}

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId,
    },
  })

  if (existingBook) return {}

  let openLibraryBook: any = {}
  try {
    openLibraryBook = await OpenLibrary.getFullBook(openLibraryWorkId, openLibraryBestEditionId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryWorkId, openLibraryBestEditionId })
    return {}
  }

  const pageTitle = `${openLibraryBook.title} by ${openLibraryBook.authorName} • catalog`
  const pageDescription = openLibraryBook.description || `catalog is a space for book people.`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
    },
  }
}

export default async function BookPageByQuery({ searchParams }) {
  const { openLibraryWorkId, openLibraryEditionId: openLibraryBestEditionId } =
    humps.camelizeKeys(searchParams)

  if (!openLibraryWorkId) notFound()

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId,
    },
  })

  if (existingBook) redirect(getBookLink(existingBook.slug))

  let openLibraryBook: any = {}
  try {
    openLibraryBook = await OpenLibrary.getFullBook(openLibraryWorkId, openLibraryBestEditionId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryWorkId, openLibraryBestEditionId })

    if (error.message?.match(/json/i) || error.message?.match(/timed out/i)) {
      const errorMessage =
        "Our book data partner OpenLibrary may be experiencing issues. Please try again later!"
      return <ErrorPage errorMessage={errorMessage} />
    } else {
      notFound()
    }
  }

  const userProfile = await getCurrentUserProfile()

  const book = {
    ...openLibraryBook,
    likeCount: 0,
  }

  return (
    <RemountOnPathChange
      ComponentToRemount={BookPage}
      book={book}
      currentUserProfile={userProfile}
    />
  )
}
