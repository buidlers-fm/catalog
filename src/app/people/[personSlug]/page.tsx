import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getMetadata } from "lib/server/metadata"
import PersonPage from "app/components/people/PersonPage"
import PersonBookRelationType from "enums/PersonBookRelationType"
import type { Metadata } from "next"
import type Person from "types/Person"
import type Book from "types/Book"
import type PersonBookRelation from "types/PersonBookRelation"

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

  const creditsByRelationType = person.personBookRelations!.reduce(
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
  creditsByRelationType
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
    creditsByRelationType,
  }

  return <PersonPage person={person} />
}
