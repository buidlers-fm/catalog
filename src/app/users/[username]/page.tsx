import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { BsLink45Deg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { PiMapPinFill } from "react-icons/pi"
import { getCurrentUserProfile } from "lib/server/auth"
import ListBook from "app/users/[username]/lists/[listSlug]/components/ListBook"
import ListCard from "app/components/lists/ListCard"
import { getUserListsLink, getListLink, sortListsByPinSortOrder } from "lib/helpers/general"
import type List from "types/List"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

const getDomainFromUrl = (url: string) => new URL(url).hostname

export default async function UserProfilePage({ params }) {
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

  const favoriteBooksList = (await prisma.list.findFirst({
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

  console.log(favoriteBooksList)

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

  const allLists = [...lists, favoriteBooksList].filter((list) => !!list) as List[]

  const allBookIds = allLists
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

  allLists.forEach((list: any) => {
    list.url = getListLink(userProfile, list.slug)

    list.books = list.listItemAssignments
      .map((lia) => {
        if (lia.listedObjectType !== "book") return null

        return allBooks.find((b) => b.id === lia.listedObjectId)
      })
      .filter((b) => !!b)
  })

  console.log(JSON.stringify(lists, null, 2))

  const isUsersProfile = currentUserProfile?.id === userProfile!.id

  const { displayName, bio, location, website, avatarUrl } = userProfile!

  return (
    <div className="mt-4 sm:w-[488px] ml:w-[832px] mx-auto">
      <div className="flex font-nunito-sans">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-24 w-24 bg-cover bg-no-repeat bg-center rounded-full"
          />
        ) : (
          <FaUserCircle className=" mr-3 text-[96px] text-gray-500" />
        )}
        <div className="ml-4 grow">
          <div className="text-2xl font-bold">{displayName || username}</div>
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
      <div className="mt-12 font-nunito-sans">
        <div className="text-gray-300 text-sm uppercase tracking-wider">Favorite Books</div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        {favoriteBooksList?.books && favoriteBooksList.books.length > 0 ? (
          <div className="p-0 grid grid-cols-1 sm:grid-cols-3 ml:grid-cols-5 gap-0 sm:gap-[28px]">
            {favoriteBooksList.books.map((book) => (
              <ListBook key={book!.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
            Nothin to see here.
          </div>
        )}
      </div>
      <div className="mt-8 font-nunito-sans">
        <div className="flex justify-between text-gray-300 text-sm">
          <div className="uppercase tracking-wider">
            {hasPinnedLists ? "Pinned lists" : "Recent lists"}
          </div>
          <div className="flex">
            {isUsersProfile && (
              <Link href="/lists/new">
                <button className="cat-btn cat-btn-sm cat-btn-gray mx-2">+ Create a list</button>
              </Link>
            )}
            <Link className="inline-block mt-1 mx-2" href={getUserListsLink(username)}>
              {isUsersProfile ? "Manage lists" : "See all"}
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
            Nothin to see here.
          </div>
        )}
      </div>
    </div>
  )
}
