import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import CreateInvite from "app/components/invites/CreateInvite"
import UserFriendsTabs from "app/users/[username]/(profilePages)/(friends)/components/UserFriendsTabs"
import FeatureFlag from "enums/FeatureFlag"
import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"

export const dynamic = "force-dynamic"

export default async function UserShelvesLayout({ params, children }) {
  const { username } = params

  const userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })) as UserProfile

  if (!userProfile) notFound()

  const generalInvitesFeatureFlag = await prisma.featureFlag.findFirst({
    where: {
      name: FeatureFlag.GeneralInvites,
    },
  })

  const generalInvitesEnabled = generalInvitesFeatureFlag?.enabled

  return (
    <div className="">
      <div className="sm:w-fit sm:mx-auto">
        {generalInvitesEnabled && (
          <div className="mb-8">
            <CreateInvite />
          </div>
        )}

        <UserFriendsTabs userProfile={userProfile} />
      </div>
      {children}
    </div>
  )
}
