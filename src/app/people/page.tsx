import { notFound, redirect } from "next/navigation"
import humps from "humps"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getPersonLinkWithSlug } from "lib/helpers/general"
import PersonPage from "app/components/people/PersonPage"
import ErrorPage from "app/error"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { openLibraryAuthorId } = humps.camelizeKeys(searchParams)

  if (!openLibraryAuthorId) return {}

  const existingPerson = await prisma.person.findFirst({
    where: {
      openLibraryAuthorId,
    },
  })

  if (existingPerson) return {}

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

  const existingPerson = await prisma.person.findFirst({
    where: {
      openLibraryAuthorId,
    },
  })

  if (existingPerson) redirect(getPersonLinkWithSlug(existingPerson.slug))

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

  const person = {
    ...openLibraryAuthor,
    authoredBooks: openLibraryAuthor.books,
    creditsByRelationType: [],
  }

  return <PersonPage person={person} />
}
