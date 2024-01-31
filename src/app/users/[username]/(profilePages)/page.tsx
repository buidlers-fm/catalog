import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import ProfileCurrentStatus from "app/users/[username]/components/ProfileCurrentStatus"
import ProfileBookNotes from "app/users/[username]/bookNotes/components/ProfileBookNotes"
import ListBook from "app/lists/components/ListBook"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"
import { getUserListsLink, getNewListLink, sortListsByPinSortOrder } from "lib/helpers/general"
import {
  decorateLists,
  decorateWithFollowers,
  decorateWithLikes,
  decorateWithComments,
} from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import UserProfile from "lib/models/UserProfile"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
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
      bookNotes: {
        where: {
          text: {
            not: null,
            notIn: [""],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          creator: true,
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
    },
  })) as UserProfileProps

  if (!userProfile) notFound()

  const [decoratedUserProfile] = await decorateWithFollowers([userProfile])

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

  if (favoriteBooksList) {
    ;[favoriteBooksList] = await decorateLists([favoriteBooksList], currentUserProfile)
  }

  let lists: List[] = []
  let hasPinnedLists = false

  const pins = await prisma.pin.findMany({
    where: {
      pinnerId: userProfile.id,
      pinnedObjectType: "list",
    },
  })

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

  lists = await decorateLists(lists, currentUserProfile)

  const _bookNotes = await decorateWithLikes(
    userProfile.bookNotes!,
    InteractionObjectType.BookNote,
    currentUserProfile,
  )

  userProfile.currentStatuses = await decorateWithLikes(
    userProfile.currentStatuses || [],
    InteractionObjectType.UserCurrentStatus,
    currentUserProfile,
  )

  userProfile.bookNotes = await decorateWithComments(
    _bookNotes,
    CommentParentType.Note,
    currentUserProfile,
  )

  const isUsersProfile = currentUserProfile?.id === userProfile.id

  const { name } = UserProfile.build(decoratedUserProfile)

  return (
    <div className="mt-4 flex flex-col lg:flex-row">
      <div className="lg:w-64 mt-4 lg:mr-16 font-mulish">
        <ProfileCurrentStatus
          userProfile={userProfile}
          // @ts-ignore
          userCurrentStatus={userProfile.currentStatuses[0]}
          isUsersProfile={isUsersProfile}
        />
      </div>
      <div className="xs:w-[400px] sm:w-[600px] lg:w-[640px] mt-8 lg:mt-4">
        <div className="font-mulish">
          <div className="cat-eyebrow">favorite books</div>
          <hr className="my-1 h-[1px] border-none bg-gray-300" />
          {favoriteBooksList?.books && favoriteBooksList.books.length > 0 ? (
            <div className="p-0 grid grid-cols-4 sm:gap-[28px]">
              {favoriteBooksList.books.map((book) => (
                <ListBook key={book!.id} book={book} isFavorite />
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-center font-newsreader italic text-lg text-gray-300">
              {isUsersProfile ? "You haven't" : `${name} hasn't`} added any favorite books yet.
              {isUsersProfile && (
                <>
                  <br />
                  Edit your profile to add some.
                </>
              )}
            </div>
          )}
        </div>

        <ProfileBookNotes userProfile={userProfile} currentUserProfile={currentUserProfile} />

        <div className="mt-16 font-mulish">
          <div className="flex justify-between text-gray-300 text-sm">
            <div className="cat-eyebrow">{hasPinnedLists ? "pinned lists" : "recent lists"}</div>
            <div
              className={`flex flex-col xs:flex-row items-end xs:items-stretch ${
                isUsersProfile ? "-mt-10 xs:-mt-3" : ""
              }`}
            >
              {isUsersProfile && (
                <Link href={getNewListLink(currentUserProfile)}>
                  <button className="cat-btn cat-btn-sm cat-btn-gray mx-2 mb-1 xs:mb-0">
                    + create a list
                  </button>
                </Link>
              )}
              <Link
                className={`inline-block ${isUsersProfile ? "my-1 xs:mb-0" : ""} mx-2`}
                href={getUserListsLink(username)}
              >
                {isUsersProfile ? "manage / more" : "more"}
              </Link>
            </div>
          </div>
          <hr className="my-1 h-[1px] border-none bg-gray-300" />
          {lists.length > 0 ? (
            <div className="">
              {lists.map((list) => (
                <ListCard key={list.id} list={list} currentUserProfile={currentUserProfile} />
              ))}
            </div>
          ) : (
            <EmptyState
              text={`${isUsersProfile ? "You haven't" : `${name} hasn't`} created any lists yet.`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
