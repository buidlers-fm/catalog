import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EditPersonBooks from "app/people/[personSlug]/edit//components/EditPersonBooks"
import PersonBookRelationType from "enums/PersonBookRelationType"
import type Person from "types/Person"
import type Book from "types/Book"
import type PersonBookRelation from "types/PersonBookRelation"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "person.edit",
    params,
  })
}

export default async function EditPersonBooksPage({ params }) {
  const { personSlug } = params

  await getCurrentUserProfile({ requireSignedIn: true, redirectPath: `/people/${personSlug}` })

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

  const authoredBooks: Book[] = person
    .personBookRelations!.filter(
      (relation) => relation.relationType === PersonBookRelationType.Author,
    )
    .map((relation) => relation.book!)

  let openLibraryBooks: Book[] = []

  if (person.openLibraryAuthorId) {
    try {
      openLibraryBooks = await OpenLibrary.getAuthorWorks(person)
    } catch (error: any) {
      reportToSentry(error, {
        method: "EditPersonBooksPage.getAuthorWorks",
        person,
      })
    }
  }

  let creditsByRelationType = person.personBookRelations!.reduce(
    (acc, relation) => {
      const { relationType } = relation

      const existingRelationType = acc.find((r) => r.relationType === relationType)

      if (existingRelationType) {
        existingRelationType.relations.push(relation)
      } else {
        acc.push({
          relationType,
          relations: [relation],
        })
      }

      return acc
    },
    [] as { relationType: string; relations: PersonBookRelation[] }[],
  )

  // sort by relation type name, then by book first published year, descending
  creditsByRelationType = creditsByRelationType
    .sort((a, b) => a.relationType.localeCompare(b.relationType))
    .map((item) => ({
      ...item,
      relations: item.relations.sort((a, b) => {
        if (typeof a.book!.firstPublishedYear !== "number") return 1
        if (typeof b.book!.firstPublishedYear !== "number") return -1

        return b.book!.firstPublishedYear - a.book!.firstPublishedYear
      }),
    }))

  person = {
    ...person,
    authoredBooks,
    openLibraryBooks,
    creditsByRelationType,
  }

  return <EditPersonBooks person={person} />
}
