import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "favorites of 2023 • catalog",
  description: `"Favorites of 2023" lists from around catalog.`,
  openGraph: {
    title: "favorites of 2023 • catalog",
    description: `"Favorites of 2023" lists from around catalog.`,
  },
}

const LISTS_LIMIT = 50

export default async function Favorites2023ListsPage() {
  const currentUserProfile = await getCurrentUserProfile()

  const _lists = await prisma.list.findMany({
    where: {
      designation: "2023",
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
      <div className="mb-2 text-sm">"Favorites of 2023" lists from around catalog.</div>
      {lists.length > 0 ? (
        lists.map((list) => <ListCard key={list.id} list={list} withByline />)
      ) : (
        <EmptyState text={`No "favorites of 2023" lists.`} />
      )}
    </div>
  )
}
