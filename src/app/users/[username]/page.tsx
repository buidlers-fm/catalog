import Link from "next/link"
import { cookies } from "next/headers"
import humps from "humps"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { BsLink45Deg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { PiMapPinFill } from "react-icons/pi"
import ListBook from "app/users/[username]/lists/[listSlug]/components/ListBook"
import ListCard from "app/components/lists/ListCard"
import { getListLink } from "lib/helpers/general"
import type List from "types/List"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

const getDomainFromUrl = (url: string) => new URL(url).hostname

export default async function UserProfilePage({ params }) {
  const { username } = params

  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const { session } = humps.camelizeKeys(data)
  const sessionUserId = session?.user?.id

  const userProfile = await prisma.userProfile.findUnique({
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

  const lists = await prisma.list.findMany({
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

  const allLists = [...lists, favoriteBooksList] as List[]

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

  const isUsersProfile = sessionUserId === userProfile?.userId

  const { displayName, bio, location, website, avatarUrl } = userProfile!

  // const bio =
  //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at nibh elit. Aliquam quis erat non velit imperdiet pretium vel eget velit. Sed sed tempus velit. Donec interdum sit amet augue ut cursus. Nunc nulla neque, finibus id volutpat eget, egestas vel tellus. Nam ultricies placerat lectus dui."

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
        <div className="text-gray-300 text-sm uppercase tracking-wider">
          Recent lists
          {isUsersProfile && (
            <Link href="/lists/new">
              <button className="cat-btn cat-btn-sm cat-btn-gray ml-4">+ Create a list</button>
            </Link>
          )}
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
