import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getMetadata } from "lib/server/metadata"
import { getPersonCredits } from "lib/server/people"
import PersonPage from "app/components/people/PersonPage"
import PersonBookRelationType from "enums/PersonBookRelationType"
import type { Metadata } from "next"
import type Person from "types/Person"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "person",
    params,
  })
}

export default async function PersonPageBySlug({ params }) {
  const { personSlug } = params

  let person = (await prisma.person.findFirst({
    where: {
      slug: personSlug,
    },
    include: {
      personBookRelations: {
        include: {
          book: true,
        },
      },
    },
  })) as Person

  if (!person) notFound()

  let authoredBooks: Book[] = []

  if (person.areBooksEdited) {
    authoredBooks = person
      .personBookRelations!.filter(
        (relation) => relation.relationType === PersonBookRelationType.Author,
      )
      .map((relation) => relation.book!)
  } else if (person.openLibraryAuthorId) {
    try {
      authoredBooks = await OpenLibrary.getAuthorWorks(person)
    } catch (error: any) {
      reportToSentry(error, {
        method: "PersonPageBySlug.getAuthorWorks",
        person,
      })
    }
  }

  const creditsByRelationType = getPersonCredits(person, { includeAuthorRelationType: false })

  person = {
    ...person,
    authoredBooks,
    creditsByRelationType,
  }

  return <PersonPage person={person} />
}
