import Link from "next/link"
import { notFound } from "next/navigation"
import { BsLink45Deg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { PiMapPinFill } from "react-icons/pi"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import ListBook from "app/lists/components/ListBook"
import ListCard from "app/components/lists/ListCard"
import {
  getUserListsLink,
  getNewListLink,
  sortListsByPinSortOrder,
  decorateLists,
} from "lib/helpers/general"
import UserProfile from "lib/models/UserProfile"
import type List from "types/List"

export const dynamic = "force-dynamic"

const getDomainFromUrl = (url: string) => new URL(url).hostname

export default async function UserProfilePage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const prismaUserProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!prismaUserProfile) notFound()
  const userProfile = UserProfile.build(prismaUserProfile)

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
    ;[favoriteBooksList] = await decorateLists([favoriteBooksList])
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
    lists = await prisma.list.findMany({
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
    })
  }

  lists = await decorateLists(lists)

  const isUsersProfile = currentUserProfile?.id === userProfile!.id

  const { name, bio, location, website, avatarUrl } = userProfile!

  return (
    <div className="mt-4 xs:w-[400px] sm:w-[600px] ml:w-[832px] mx-auto">
      <div className="sm:flex font-mulish">
        {avatarUrl ? (
          <div className="shrink-0 sm:mr-3 w-24 h-24 overflow-hidden rounded-full">
            <img src={avatarUrl} alt="user avatar" className="object-cover min-w-full min-h-full" />
          </div>
        ) : (
          <FaUserCircle className="mr-3 text-[96px] text-gray-500" />
        )}
        <div className="my-6 sm:my-0 sm:ml-4 grow">
          <div className="text-2xl font-bold">{name}</div>
          <div className="mt-2 max-w-lg whitespace-pre-wrap">{bio}</div>
          <div className="flex mt-3 text-gray-300">
            {location && (
              <div>
                <PiMapPinFill className="inline-block -mt-[5px] mr-1" />
                {location}
              </div>
            )}
            {website && (
              <div className="ml-4">
                <BsLink45Deg className="inline-block -mt-[3px] mr-1 text-lg " />
                <Link href={website} target="_blank" rel="noopener noreferrer">
                  {getDomainFromUrl(website)}
                </Link>
              </div>
            )}
          </div>
        </div>
        <div>
          {isUsersProfile && (
            <Link href="/settings/profile">
              <button className="cat-btn cat-btn-gray">Edit Profile</button>
            </Link>
          )}
        </div>
      </div>
      <div className="mt-12 font-mulish">
        <div className="text-gray-300 text-sm uppercase tracking-wider">Favorite Books</div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        {favoriteBooksList?.books && favoriteBooksList.books.length > 0 ? (
          <div className="p-0 grid grid-cols-4 sm:gap-[28px]">
            {favoriteBooksList.books.map((book) => (
              <ListBook key={book!.id} book={book} isFavorite />
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-center font-newsreader italic text-lg text-gray-300">
            {isUsersProfile ? "You haven't" : `${name} hasn't`} added any
            favorite books yet.
            {isUsersProfile && (
              <>
                <br />
                Edit your profile to add some.
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-16 font-mulish">
        <div className="flex justify-between text-gray-300 text-sm">
          <div className="uppercase tracking-wider">
            {hasPinnedLists ? "Pinned lists" : "Recent lists"}
          </div>
          <div
            className={`flex flex-col xs:flex-row items-end xs:items-stretch ${
              isUsersProfile ? "-mt-10 xs:-mt-3" : ""
            }`}
          >
            {isUsersProfile && (
              <Link href={getNewListLink(currentUserProfile)}>
                <button className="cat-btn cat-btn-sm cat-btn-gray mx-2 mb-1 xs:mb-0">
                  + Create a list
                </button>
              </Link>
            )}
            <Link
              className={`inline-block ${isUsersProfile ? "my-1 xs:mb-0" : ""} mx-2`}
              href={getUserListsLink(username)}
            >
              {isUsersProfile ? "See all / Manage" : "See all"}
            </Link>
          </div>
        </div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        {lists.length > 0 ? (
          <div className="">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
            {isUsersProfile ? "You haven't" : `${name} hasn't`} created any lists
            yet.
          </div>
        )}
      </div>
    </div>
  )
}
