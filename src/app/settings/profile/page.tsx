import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { getCurrentUserProfile } from "lib/server/auth"
import { attachBooksToLists } from "lib/helpers/general"
import EditProfile from "app/settings/profile/components/EditProfile"
import type List from "types/List"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function SettingsProfilePage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile) redirect("/")

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
  })) as List

  if (favoriteBooksList) {
    ;[favoriteBooksList] = await attachBooksToLists([favoriteBooksList])
  }

  return <EditProfile userProfile={userProfile} favoriteBooksList={favoriteBooksList} />
}
