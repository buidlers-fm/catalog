import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { isCurrentStatusVisible } from "lib/server/userCurrentStatuses"
import { areShelvesVisible } from "lib/api/userBookShelves"
import { sortListsByPinSortOrder } from "lib/helpers/general"
import { decorateLists, decorateWithLikes } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import UserProfilePageComponent from "app/users/[username]/components/UserProfilePageComponent"
import InteractionObjectType from "enums/InteractionObjectType"
import UserBookShelf from "enums/UserBookShelf"
import type { UserProfileProps } from "lib/models/UserProfile"
import type List from "types/List"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile",
    params,
  })
}

export default async function UserProfilePage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
    include: {
      bookShelfAssignments: {
        where: {
          shelf: {
            in: [UserBookShelf.CurrentlyReading, UserBookShelf.Read],
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          book: true,
        },
      },
      currentStatuses: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          book: true,
        },
      },
      pins: {
        where: {
          pinnedObjectType: "list",
        },
      },
    },
  })) as UserProfileProps

  if (!userProfile) notFound()

  const showCurrentStatus = await isCurrentStatusVisible(userProfile, currentUserProfile)
  const showShelves = await areShelvesVisible(userProfile, currentUserProfile)

  let favoriteBooksList = (await prisma.list.findFirst({
    where: {
      ownerId: userProfile.id,
      designation: "favorite",
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  })) as List | null

  let lists: List[] = []
  let hasPinnedLists = false

  const pins = userProfile.pins || []

  const pinnedListIds = pins.map((pin) => pin.pinnedObjectId)

  if (pins.length > 0) {
    const _lists = await prisma.list.findMany({
      where: {
        id: {
          in: pinnedListIds,
        },
        ownerId: userProfile.id,
        designation: null,
      },
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    lists = sortListsByPinSortOrder(_lists, pins)
    hasPinnedLists = true
  } else {
    lists = (await prisma.list.findMany({
      where: {
        ownerId: userProfile.id,
        designation: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })) as List[]
  }

  let allLists = lists
  if (favoriteBooksList) {
    allLists = [favoriteBooksList, ...lists]
  }

  ;[favoriteBooksList, ...lists] = await decorateLists(allLists, currentUserProfile)

  userProfile.currentStatuses = await decorateWithLikes(
    userProfile.currentStatuses || [],
    InteractionObjectType.UserCurrentStatus,
    currentUserProfile,
  )

  return (
    <UserProfilePageComponent
      userProfile={userProfile}
      lists={lists}
      favoriteBooksList={favoriteBooksList}
      currentUserProfile={currentUserProfile}
      hasPinnedLists={hasPinnedLists}
      showCurrentStatus={showCurrentStatus}
      showShelves={showShelves}
    />
  )
}
