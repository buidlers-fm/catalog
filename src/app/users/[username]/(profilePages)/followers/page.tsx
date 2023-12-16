import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithFollowers } from "lib/server/decorators"
import UserProfileCard from "app/components/userProfiles/UserProfileCard"
import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"

export const dynamic = "force-dynamic"

export default async function UserFollowersPage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  let userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })) as UserProfile

  if (!userProfile) notFound()
  ;[userProfile] = await decorateWithFollowers([userProfile])

  const { followers: _followers } = userProfile
  const followers = await decorateWithFollowers(_followers as UserProfile[])

  return (
    <div className="mt-4 max-w-lg mx-auto font-mulish">
      <div className="mt-8">
        {followers ? (
          followers.length > 0 ? (
            <div className="">
              {followers.map((follower) => (
                <UserProfileCard
                  key={follower.id}
                  userProfile={follower}
                  currentUserProfile={currentUserProfile}
                />
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
              No followers yet.
            </div>
          )
        ) : (
          <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}