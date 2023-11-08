import { PrismaClient } from "@prisma/client"
import { getCurrentUserProfile } from "lib/server/auth"
import { getListLink } from "lib/helpers/general"
import ManageLists from "app/users/[username]/lists/components/ManageLists"
import UserListsIndex from "app/users/[username]/lists/components/UsersListIndex"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function UserListsIndexPage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      username,
    },
  })

  if (!userProfile) throw new Error("User not found")
  console.log("profile page fetch:")
  console.log(userProfile)

  const lists = await prisma.list.findMany({
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

  const allBookIds = lists
    .map((list) =>
      list.listItemAssignments
        .filter((lia) => lia.listedObjectType === "book")
        .map((lia) => lia.listedObjectId),
    )
    .flat()

  const allBooks = await prisma.book.findMany({
    where: {
      id: {
        in: allBookIds,
      },
    },
  })

  lists.forEach((list: any) => {
    list.url = getListLink(userProfile, list.slug)

    list.books = list.listItemAssignments
      .map((lia) => {
        if (lia.listedObjectType !== "book") return null

        return allBooks.find((b) => b.id === lia.listedObjectId)
      })
      .filter((b) => !!b)
  })

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
