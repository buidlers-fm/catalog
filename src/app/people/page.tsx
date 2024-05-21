import { notFound } from "next/navigation"
import humps from "humps"
// import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import PersonPage from "app/components/people/PersonPage"
import ErrorPage from "app/error"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { openLibraryAuthorId } = humps.camelizeKeys(searchParams)

  if (!openLibraryAuthorId) return {}

  // const existingBook = await prisma.book.findFirst({
  //   where: {
  //     openLibraryWorkId,
  //   },
  // })

  // if (existingBook) return {}

  let openLibraryAuthor: any = {}
  try {
    openLibraryAuthor = await OpenLibrary.getAuthor(openLibraryAuthorId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryAuthorId })
    return {}
  }

  const pageTitle = `${openLibraryAuthor.name} • catalog`
  const pageDescription = openLibraryAuthor.bio || `catalog is a space for book people.`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
    },
  }
}

export default async function PersonPageByQuery({ searchParams }) {
  const { openLibraryAuthorId } = humps.camelizeKeys(searchParams)

  if (!openLibraryAuthorId) notFound()

  // const existingBook = await prisma.book.findFirst({
  //   where: {
  //     openLibraryWorkId,
  //   },
  // })

  // if (existingBook) redirect(getBookLink(existingBook.slug))

  let openLibraryAuthor: any = {}
  try {
    openLibraryAuthor = await OpenLibrary.getAuthor(openLibraryAuthorId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryAuthorId })

    if (error.message?.match(/json/i) || error.message?.match(/timed out/i)) {
      const errorMessage =
        "Our book data partner OpenLibrary may be experiencing issues. Please try again later!"
      return <ErrorPage errorMessage={errorMessage} />
    } else {
      notFound()
    }
  }
  return <PersonPage person={openLibraryAuthor} />
}
