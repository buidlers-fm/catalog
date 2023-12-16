import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithFollowers, decorateWithFollowing } from "lib/server/decorators"
import UserProfileCard from "app/components/userProfiles/UserProfileCard"
import UserProfile, { UserProfileProps } from "lib/models/UserProfile"

export const dynamic = "force-dynamic"

export default async function UserFollowingPage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  let userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })) as UserProfileProps

  if (!userProfile) notFound()
  ;[userProfile] = await decorateWithFollowing([userProfile])

  const decoratedUserProfile = UserProfile.build(userProfile)

  const { name, following: _following } = decoratedUserProfile
  const following = await decorateWithFollowers(_following as UserProfileProps[])

  return (
    <div className="mt-4 max-w-lg mx-auto font-mulish">
      <div className="mt-8">
        {following ? (
          following.length > 0 ? (
            <div className="">
              {following.map((followedUserProfile) => (
                <UserProfileCard
                  key={followedUserProfile.id}
                  userProfile={followedUserProfile}
                  currentUserProfile={currentUserProfile}
                />
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
              {name} isn't following anyone yet.
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
