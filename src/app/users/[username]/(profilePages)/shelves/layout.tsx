import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import UserShelvesTabs from "app/users/[username]/(profilePages)/shelves/components/UserShelvesTabs"
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

  return (
    <div className="">
      <div className="sm:w-fit sm:mx-auto">
        <UserShelvesTabs userProfile={userProfile} />
      </div>
      {children}
    </div>
  )
}
