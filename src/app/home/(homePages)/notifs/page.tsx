import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateNotifs } from "lib/server/decorators"
import NotifCard from "app/components/notifs/NotifCard"
import EmptyState from "app/components/EmptyState"
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
  const currentUserProfile = await getCurrentUserProfile()

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

  return (
    <div className="max-w-xl mx-auto font-mulish">
      {notifs.length > 0 ? (
        notifs.map((notif) => (
          <NotifCard key={notif.id} notif={notif} currentUserProfile={currentUserProfile} />
        ))
      ) : (
        <EmptyState text="You don't have any notifications." />
      )}
    </div>
  )
}
