import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EditPerson from "app/people/[personSlug]/edit//components/EditPerson"
import type Person from "types/Person"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "person.edit",
    params,
  })
}

export default async function EditPersonPage({ params }) {
  const { personSlug } = params

  await getCurrentUserProfile({ requireSignedIn: true, redirectPath: `/people/${personSlug}` })

  const person = (await prisma.person.findFirst({
    where: {
      slug: personSlug,
    },
  })) as Person

  if (!person) notFound()

  return <EditPerson person={person} />
}
