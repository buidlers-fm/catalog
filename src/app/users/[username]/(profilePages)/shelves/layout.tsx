import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { areShelvesVisible } from "lib/api/userBookShelves"
import UserShelvesTabs from "app/users/[username]/(profilePages)/shelves/components/UserShelvesTabs"
import EmptyState from "app/components/EmptyState"
import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"

export const dynamic = "force-dynamic"

export default async function UserShelvesLayout({ params, children }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })) as UserProfile

  if (!userProfile) notFound()

  const name = userProfile.displayName || userProfile.username

  const shelvesVisible = await areShelvesVisible(userProfile, currentUserProfile)

  if (!shelvesVisible) {
    return (
      <div className="">
        <div className="sm:w-fit sm:mx-auto">
          <EmptyState text={`${name}'s shelves are private.`} />
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="sm:w-fit sm:mx-auto">
        <UserShelvesTabs userProfile={userProfile} />
      </div>
      {children}
    </div>
  )
}
