import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"
import TaggedObjectType from "enums/TaggedObjectType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "to read in 2024 • catalog",
  description: `"To read in 2024" lists from around catalog.`,
  openGraph: {
    title: "to read in 2024 • catalog",
    description: `"To read in 2024" lists from around catalog.`,
  },
}

const LISTS_LIMIT = 50

export default async function Favorites2023ListsPage() {
  const currentUserProfile = await getCurrentUserProfile()

  const tagAssignments = await prisma.tagAssignment.findMany({
    where: {
      tag: "2024",
      scopeType: null,
      taggedObjectType: TaggedObjectType.List,
    },
  })

  const listIds = tagAssignments.map((tagAssignment) => tagAssignment.taggedObjectId)

  const _lists = await prisma.list.findMany({
    where: {
      id: {
        in: listIds,
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
    take: LISTS_LIMIT,
  })

  const lists = await decorateLists(_lists, currentUserProfile)

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="mb-2 text-sm">"To read in 2024" lists from around catalog.</div>
      {lists.length > 0 ? (
        lists.map((list) => <ListCard key={list.id} list={list} withByline />)
      ) : (
        <EmptyState text={`No "to read in 2024" lists.`} />
      )}
    </div>
  )
}
