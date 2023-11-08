import { redirect } from "next/navigation"
import { PrismaClient, Book as DbBook } from "@prisma/client"
import { getCurrentUserProfile } from "lib/server/auth"
import EditProfile from "app/settings/profile/components/EditProfile"
import type List from "types/List"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function SettingsProfilePage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile) redirect("/")

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
