import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import ManageLists from "app/users/[username]/lists/components/ManageLists"
import UserListsIndex from "app/users/[username]/lists/components/UsersListIndex"
import type { Metadata } from "next"

const LISTS_LIMIT = 8

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.lists",
    params,
  })
}

export default async function UserListsIndexPage({ params, searchParams }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!userProfile) notFound()

  let { page } = await searchParams
  if (!page) page = 1

  const _lists = await prisma.list.findMany({
    where: {
      ownerId: userProfile.id,
      designation: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    skip: LISTS_LIMIT * page,
    take: LISTS_LIMIT,
  })

  const lists = await decorateLists(_lists, currentUserProfile)

  const pins = await prisma.pin.findMany({
    where: {
      pinnerId: userProfile.id,
      pinnedObjectType: "list",
    },
    orderBy: {
      sortOrder: "asc",
    },
  })

  const isUsersProfile = currentUserProfile?.id === userProfile!.id

  if (isUsersProfile) {
    return <ManageLists lists={lists} pins={pins} />
  } else {
    return (
      <UserListsIndex
        lists={lists}
        userProfile={userProfile}
        currentUserProfile={currentUserProfile}
      />
    )
  }
}
