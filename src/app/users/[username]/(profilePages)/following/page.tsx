import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithFollowers, decorateWithFollowing } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import UserProfileCard from "app/components/userProfiles/UserProfileCard"
import UserProfile, { UserProfileProps } from "lib/models/UserProfile"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.following",
    params,
  })
}

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

  const isUsersProfile = currentUserProfile?.id === userProfile.id

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
            <EmptyState
              text={`${isUsersProfile ? "You're not" : `${name} isn't`} following anyone yet.`}
            />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
