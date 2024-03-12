import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book.lists",
    params,
  })
}

export default async function BookListsIndexPage({ params }) {
  const { bookSlug } = params

  const currentUserProfile = await getCurrentUserProfile()

  const book = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!book) notFound()

  const _lists = await prisma.list.findMany({
    where: {
      designation: null,
      listItemAssignments: {
        some: {
          listedObjectType: "book",
          listedObjectId: book.id,
        },
      },
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const lists = await decorateLists(_lists, currentUserProfile)

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-eyebrow">Lists that include</div>
      <h1 className="my-2 text-4xl font-semibold font-newsreader">{book.title}</h1>
      <div className="mt-4">
        {lists.length > 0 ? (
          <div className="">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                currentUserProfile={currentUserProfile}
                withByline
              />
            ))}
          </div>
        ) : (
          <EmptyState text={`${book.title} isn't on any lists yet.`} />
        )}
      </div>
    </div>
  )
}
