import { cookies } from "next/headers"
import humps from "humps"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient, Book as DbBook } from "@prisma/client"
import EditList from "app/lists/new/components/EditList"
import type List from "types/List"

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

  const isUsersList = sessionUserId === userProfile?.userId
  if (!isUsersList) throw new Error("You can only edit your own lists.")

  const list = (await prisma.list.findUnique({
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
    .filter((b) => !!b) as DbBook[]

  list.dbBooks = books
  return <EditList list={list} isEdit />
}
