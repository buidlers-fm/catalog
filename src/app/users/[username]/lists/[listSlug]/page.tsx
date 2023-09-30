import Link from "next/link"
import { cookies } from "next/headers"
import humps from "humps"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { getUserProfileLink } from "lib/helpers/general"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function UserListPage({ params }) {
  const { username, listSlug } = params

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

  if (!userProfile) throw new Error("List not found")
  console.log(userProfile)
  console.log(userProfile.userId)
  console.log(listSlug)

  const list = await prisma.list.findUnique({
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

  const books = await prisma.book.findMany({
    where: {
      id: {
        in: bookIds,
      },
    },
  })

  const isUsersList = sessionUserId === userProfile?.userId

  const { title } = list
  const { displayName, avatarUrl } = userProfile!

  const description =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at nibh elit. Aliquam quis erat non velit imperdiet pretium vel eget velit. Sed sed tempus velit. Donec interdum sit amet augue ut cursus. Nunc nulla neque, finibus id volutpat eget, egestas vel tellus. Nam ultricies placerat lectus dui."

  const convertImageUrlToLarge = (imageUrl) => {
    const pattern = /-M(\.\w+)$/ // filename ends in "-M", followed by file extension
    const match = imageUrl.match(pattern)

    if (!match) return imageUrl

    const fileExtension = match[1]
    const largeImageUrl = imageUrl.replace(pattern, `-L${fileExtension}`)

    return largeImageUrl
  }

  return (
    <div className="mt-4 sm:w-[488px] ml:w-[832px] mx-auto">
      <div className="text-4xl font-semibold mb-1">{title}</div>
      <div className="my-2 text-gray-200 font-nunito-sans">
        a list by{" "}
        <Link href={getUserProfileLink(username)} className="cat-underline">
          {displayName}
        </Link>
      </div>
      <div className="my-4">{description}</div>
      <div className="my-8 p-0 grid grid-cols-1 sm:grid-cols-3 ml:grid-cols-5 gap0 sm:gap-[28px]">
        {books.map((book) => (
          <div
            key={book.id}
            className="w-[288px] sm:w-[144px] h-auto my-8 mx-auto sm:my-4 flex items-center justify-center"
          >
            <img
              src={convertImageUrlToLarge(book.coverImageUrl) as any}
              className="w-full"
              alt={`${book.title} cover`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
