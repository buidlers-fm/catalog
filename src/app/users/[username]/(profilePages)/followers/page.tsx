import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithFollowers } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import UserProfileCard from "app/components/userProfiles/UserProfileCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.followers",
    params,
  })
}

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
            <EmptyState text="No followers yet." />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
