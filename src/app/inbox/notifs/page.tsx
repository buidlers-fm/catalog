import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateNotifs } from "lib/server/decorators"
import NotifsIndex from "app/home/components/NotifsIndex"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "notifs • catalog",
  openGraph: {
    title: "notifs • catalog",
  },
}

const NOTIFS_LIMIT = 50

export default async function NotifsPage() {
  const currentUserProfile = await getCurrentUserProfile({ requireSignedIn: true })

  let notifs = await prisma.notification.findMany({
    where: {
      agentId: {
        not: currentUserProfile.id,
      },
      notifiedUserProfileId: currentUserProfile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: NOTIFS_LIMIT,
  })

  notifs = await decorateNotifs(notifs)

  return <NotifsIndex notifs={notifs} currentUserProfile={currentUserProfile} />
}
