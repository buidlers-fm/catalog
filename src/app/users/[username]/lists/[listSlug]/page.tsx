import { notFound } from "next/navigation"
import humps from "humps"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import UserList from "app/users/[username]/lists/[listSlug]/components/UserList"
import { decorateLists } from "lib/server/decorators"
import ListDesignation from "enums/ListDesignation"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

dayjs.extend(relativeTime)

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.list",
    params,
  })
}

export default async function UserListPage({ params, searchParams }) {
  const { username, listSlug } = params
  const { view } = humps.camelizeKeys(searchParams)

  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!userProfile) notFound()

  const _list = await prisma.list.findFirst({
    where: {
      ownerId: userProfile.id,
      slug: listSlug,
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  })

  if (!_list) notFound()

  const _currentUserReadList = await prisma.list.findFirst({
    where: {
      ownerId: currentUserProfile?.id,
      designation: ListDesignation.Read,
    },
    include: {
      listItemAssignments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  const [list, currentUserReadList] = await decorateLists(
    [_list, _currentUserReadList],
    currentUserProfile,
    { includeLikedByCreator: true },
  )

  const isUsersList = currentUserProfile?.id === userProfile!.id

  return (
    <UserList
      userProfile={userProfile}
      list={list}
      isUsersList={isUsersList}
      currentUserProfile={currentUserProfile}
      currentUserReadList={currentUserReadList}
      view={view}
    />
  )
}
