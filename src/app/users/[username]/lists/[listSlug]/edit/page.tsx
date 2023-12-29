import { redirect, notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import EditList from "app/users/[username]/lists/new/components/EditList"
import type List from "types/List"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.list.edit",
    params,
  })
}

export default async function UserListPage({ params }) {
  const { username, listSlug } = params

  const currentUserProfile = await getCurrentUserProfile()
  if (!currentUserProfile) redirect("/home")

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!userProfile) notFound()

  const isUsersList = currentUserProfile.id === userProfile!.id
  if (!isUsersList) notFound()

  const _list = (await prisma.list.findFirst({
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
  })) as List

  if (!_list) notFound()

  const [list] = await decorateLists([_list], currentUserProfile)

  return <EditList list={list} currentUserProfile={currentUserProfile} isEdit />
}
