import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EditPersonBooks from "app/people/[personSlug]/edit//components/EditPersonBooks"
import type Person from "types/Person"
import type Book from "types/Book"
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

  const books: Book[] = person.personBookRelations!.map((relation) => relation.book!)

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

  person = {
    ...person,
    books,
    openLibraryBooks,
  }

  return <EditPersonBooks person={person} />
}
