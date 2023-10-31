import { cookies } from "next/headers"
import { PrismaClient, Book as DbBook } from "@prisma/client"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import humps from "humps"
import EditProfile from "app/settings/profile/components/EditProfile"
import type List from "types/List"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function SettingsProfilePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const { session } = humps.camelizeKeys(data)
  if (!session) throw new Error("no session found")

  const userId = session.user.id

  const userProfileRes = await prisma.userProfile.findUnique({ where: { userId } })
  if (!userProfileRes) throw new Error("no profile found for user")

  const userProfile = humps.camelizeKeys(userProfileRes)

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
  })) as List

  if (favoriteBooksList) {
    const bookIds = favoriteBooksList.listItemAssignments
      .filter((lia) => lia.listedObjectType === "book")
      .map((lia) => lia.listedObjectId)

    const _books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
    })

    const books = favoriteBooksList.listItemAssignments
      .map((lia) => {
        if (lia.listedObjectType !== "book") return null

        return _books.find((b) => b.id === lia.listedObjectId)
      })
      .filter((b) => !!b) as DbBook[]

    favoriteBooksList.dbBooks = books
  }
  return <EditProfile userProfile={userProfile} favoriteBooksList={favoriteBooksList} />
}
