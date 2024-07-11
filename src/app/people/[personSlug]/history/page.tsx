import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getMetadata } from "lib/server/metadata"
import { getPersonLinkWithSlug } from "lib/helpers/general"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import EditLogCard from "app/components/EditLogCard"
import EditedObjectType from "enums/EditedObjectType"
import type { Metadata } from "next"
import type Person from "types/Person"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "person.history",
    params,
  })
}

export default async function PersonEditsPage({ params }) {
  const { personSlug } = params

  const person = (await prisma.person.findFirst({
    where: {
      slug: personSlug,
    },
  })) as Person

  if (!person) notFound()

  let editLogs = await prisma.editLog.findMany({
    where: {
      editedObjectId: person.id,
      editedObjectType: EditedObjectType.Person,
    },
    include: {
      editor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  editLogs = editLogs.map((editLog) => ({
    ...editLog,
    editedObject: person,
  }))

  return (
    <div className="mt-4 max-w-3xl mx-auto px-8 font-mulish">
      <div className="cat-eyebrow">edits history</div>
      <Link href={getPersonLinkWithSlug(personSlug)}>
        <h1 className="my-2 text-4xl font-semibold font-newsreader">{person.name}</h1>
      </Link>

      <div className="mt-4">
        {editLogs ? (
          editLogs.length > 0 ? (
            <div className="">
              {editLogs.map((editLog) => (
                <EditLogCard key={editLog.id} editLog={editLog} withImage={false} />
              ))}
            </div>
          ) : (
            <EmptyState text={`${person.name} hasn't been edited yet.`} />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
