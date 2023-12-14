import { notFound } from "next/navigation"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import UserList from "app/users/[username]/lists/[listSlug]/components/UserList"
import { decorateLists } from "lib/server/decorators"

export const dynamic = "force-dynamic"

dayjs.extend(relativeTime)

export default async function UserListPage({ params }) {
  const { username, listSlug } = params

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

  const [list] = await decorateLists([_list], currentUserProfile)

  const isUsersList = currentUserProfile?.id === userProfile!.id

  return (
    <UserList
      userProfile={userProfile}
      list={list}
      isUsersList={isUsersList}
      currentUserProfile={currentUserProfile}
    />
  )
}
