import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { getCurrentUserProfile } from "lib/server/auth"
import ListBook from "app/users/[username]/lists/[listSlug]/components/ListBook"
import { getUserProfileLink, getEditListLink } from "lib/helpers/general"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

dayjs.extend(relativeTime)

export default async function UserListPage({ params }) {
  const { username, listSlug } = params

  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!userProfile) throw new Error("List not found")
  console.log(userProfile)
  console.log(userProfile.userId)
  console.log(listSlug)

  const list = await prisma.list.findFirst({
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

  if (!list) throw new Error("List not found")
  console.log(list)

  const bookIds = list.listItemAssignments
    .filter((lia) => lia.listedObjectType === "book")
    .map((lia) => lia.listedObjectId)

  const _books = await prisma.book.findMany({
    where: {
      id: {
        in: bookIds,
      },
    },
  })

  const books = list.listItemAssignments
    .map((lia) => {
      if (lia.listedObjectType !== "book") return null

      return _books.find((b) => b.id === lia.listedObjectId)
    })
    .filter((b) => !!b)

  const isUsersList = currentUserProfile?.id === userProfile!.id

  const { title, description, createdAt, updatedAt } = list
  const { displayName } = userProfile!
  const createdAtStr = dayjs(createdAt).fromNow()
  const updatedAtStr = updatedAt ? dayjs(updatedAt).fromNow() : createdAtStr

  // const description =
  //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at nibh elit. Aliquam quis erat non velit imperdiet pretium vel eget velit. Sed sed tempus velit. Donec interdum sit amet augue ut cursus. Nunc nulla neque, finibus id volutpat eget, egestas vel tellus. Nam ultricies placerat lectus dui."

  return (
    <div className="mt-4 sm:w-[488px] ml:w-[832px] mx-auto">
      <div className="flex">
        <div className="text-4xl font-semibold mb-1">{title}</div>
        {isUsersList && (
          <Link href={getEditListLink(userProfile, listSlug)}>
            <button className="cat-btn cat-btn-sm cat-btn-gray ml-6">Edit list</button>
          </Link>
        )}
      </div>
      <div className="my-2 text-gray-200 font-nunito-sans">
        a list by{" "}
        <Link href={getUserProfileLink(username)} className="cat-underline">
          {displayName}
        </Link>
      </div>
      <div className="my-3 text-gray-500 text-sm font-nunito-sans">
        created {createdAtStr}, last updated {updatedAtStr}
      </div>
      <div className="my-4">{description}</div>
      <div className="my-8 p-0 grid grid-cols-1 sm:grid-cols-3 ml:grid-cols-5 gap0 sm:gap-[28px]">
        {books.map((book) => (
          <ListBook key={book!.id} book={book} />
        ))}
      </div>
    </div>
  )
}
