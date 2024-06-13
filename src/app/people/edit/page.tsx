import { redirect, notFound } from "next/navigation"
import humps from "humps"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getPersonEditLink, generateUniqueSlug } from "lib/helpers/general"

export const dynamic = "force-dynamic"

export default async function EditPersonPage({ searchParams }) {
  const { openLibraryAuthorId } = humps.camelizeKeys(searchParams)

  if (!openLibraryAuthorId) notFound()

  const existingPerson = await prisma.person.findFirst({
    where: {
      openLibraryAuthorId,
    },
  })

  if (existingPerson) redirect(getPersonEditLink(existingPerson.slug))

  let openLibraryAuthor: any = {}
  try {
    openLibraryAuthor = await OpenLibrary.getAuthor(openLibraryAuthorId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryAuthorId })
    notFound()
  }

  const { name, bio, imageUrl, wikipediaUrl, wikidataId } = openLibraryAuthor

  const slug = await generateUniqueSlug(name, "person")

  const createdPerson = await prisma.person.create({
    data: {
      slug,
      name,
      bio,
      imageUrl,
      wikipediaUrl,
      openLibraryAuthorId,
      wikidataId,
    },
  })

  redirect(getPersonEditLink(createdPerson.slug))
}
