import Link from "next/link"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "explore lists • catalog",
  description: "Recent lists from around catalog.",
  openGraph: {
    title: "explore lists • catalog",
    description: "Recent lists from around catalog.",
  },
}

const LISTS_LIMIT = 50

export default async function RecentListsPage() {
  const currentUserProfile = await getCurrentUserProfile()

  const _lists = await prisma.list.findMany({
    where: {
      designation: null,
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
      <div className="cat-page-title mb-4">
        <Link href="/explore" className="cat-link">
          explore
        </Link>
        {" / "}lists
      </div>
      <div className="mb-2 text-sm">Recent lists from around catalog.</div>
      {lists.length > 0 ? (
        lists.map((list) => (
          <ListCard key={list.id} list={list} currentUserProfile={currentUserProfile} withByline />
        ))
      ) : (
        <EmptyState text="No recent lists." />
      )}
    </div>
  )
}
