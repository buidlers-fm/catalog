import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { attachBooksToLists, getListLink } from "lib/helpers/general"
import ManageLists from "app/users/[username]/lists/components/ManageLists"
import UserListsIndex from "app/users/[username]/lists/components/UsersListIndex"

export const dynamic = "force-dynamic"

export default async function UserListsIndexPage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!userProfile) throw new Error("User not found")
  console.log("profile page fetch:")
  console.log(userProfile)

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
  })

  const lists = (await attachBooksToLists(_lists)).map((list) => ({
    ...list,
    url: getListLink(userProfile, list.slug),
  }))

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
    return <UserListsIndex lists={lists} userProfile={userProfile} />
  }
}
