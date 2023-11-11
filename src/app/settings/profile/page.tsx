import { redirect } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/helpers/general"
import EditProfile from "app/settings/profile/components/EditProfile"
import type List from "types/List"

export const dynamic = "force-dynamic"

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
    ;[favoriteBooksList] = await decorateLists([favoriteBooksList])
  }

  return <EditProfile userProfile={userProfile} favoriteBooksList={favoriteBooksList} />
}
