import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import EditProfile from "app/settings/profile/components/EditProfile"
import type List from "types/List"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "edit profile • settings • catalog",
  openGraph: {
    title: "edit profile • settings • catalog",
  },
}

export default async function SettingsProfilePage() {
  const userProfile = await getCurrentUserProfile({ requireSignedIn: true })

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
    ;[favoriteBooksList] = await decorateLists([favoriteBooksList], userProfile)
  }

  return <EditProfile userProfile={userProfile} favoriteBooksList={favoriteBooksList} />
}
