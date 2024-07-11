import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getMetadata } from "lib/server/metadata"
import { getBookLink } from "lib/helpers/general"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import EditLogCard from "app/components/EditLogCard"
import EditedObjectType from "enums/EditedObjectType"
import type { Metadata } from "next"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book.history",
    params,
  })
}

export default async function BookEditsPage({ params }) {
  const { bookSlug } = params

  const book = (await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })) as Book

  if (!book) notFound()

  let editLogs = await prisma.editLog.findMany({
    where: {
      editedObjectId: book.id,
      editedObjectType: EditedObjectType.Book,
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
    editedObject: book,
  }))

  return (
    <div className="mt-4 max-w-3xl mx-auto px-8 font-mulish">
      <div className="cat-eyebrow">edits history</div>
      <Link href={getBookLink(book.slug!)}>
        <h1 className="my-2 text-4xl font-semibold font-newsreader">{book.title}</h1>
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
            <EmptyState text={`${book.title} hasn't been edited yet.`} />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
