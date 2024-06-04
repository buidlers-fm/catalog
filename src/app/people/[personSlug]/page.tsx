import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getMetadata } from "lib/server/metadata"
import PersonPage from "app/components/people/PersonPage"
import type { Metadata } from "next"
import type Person from "types/Person"

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
  })) as Person

  if (!person) notFound()

  let books = []

  if (person.openLibraryAuthorId) {
    try {
      books = await OpenLibrary.getAuthorWorks(person)
    } catch (error: any) {
      reportToSentry(error, {
        method: "PersonPageBySlug.getAuthorWorks",
        person,
      })
    }
  }

  person = {
    ...person,
    books,
  }

  return <PersonPage person={person} />
}
