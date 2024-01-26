import prisma from "lib/prisma"
import { getMetadata } from "lib/server/metadata"
import { getCurrentUserProfile } from "lib/server/auth"
import AdminWaitlist from "app/admin/waitlist/components/AdminWaitlist"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "admin.waitlist",
    params,
  })
}

export default async function AdminWaitlistPage() {
  const currentUserProfile = await getCurrentUserProfile()

  let waitlisters = await prisma.waitlister.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  // de-dupe because we have duplicate records for some reason
  const emailSet = new Set()
  waitlisters = waitlisters.filter((waitlister) => {
    if (emailSet.has(waitlister.email)) return false

    emailSet.add(waitlister.email)
    return true
  })

  // attach user profiles
  const invitedByUserProfileIds = waitlisters
    .map((waitlister) => waitlister.invitedByUserProfileId)
    .filter(Boolean)

  const invitedByUserProfiles = await prisma.userProfile.findMany({
    where: {
      id: {
        in: invitedByUserProfileIds as string[],
      },
    },
  })

  waitlisters = waitlisters.map((waitlister) => {
    let invitedByUserProfile

    if (waitlister.invitedByUserProfileId) {
      invitedByUserProfile = invitedByUserProfiles.find(
        (userProfile) => userProfile.id === waitlister.invitedByUserProfileId,
      )
    }

    return {
      ...waitlister,
      invitedByUserProfile,
    }
  })

  return <AdminWaitlist waitlisters={waitlisters} currentUserProfile={currentUserProfile} />
}
