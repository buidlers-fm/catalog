import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithFollowing } from "lib/server/decorators"
import ExplorePageComponent from "app/explore/components/ExplorePageComponent"
import NotifsBanner from "app/home/components/NotifsBanner"
import FriendsLatestShelved from "app/home/components/FriendsLatestShelved"
import ProfileCurrentStatus from "app/users/[username]/components/ProfileCurrentStatus"
import FriendsCurrentStatuses from "app/components/userCurrentStatuses/FriendsCurrentStatuses"
import FriendsNotes from "app/home/components/FriendsNotes"
import FriendsLists from "app/home/components/FriendsLists"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "catalog • home",
  openGraph: {
    title: "catalog • home",
  },
}

export default async function HomePage() {
  const include = {
    currentStatuses: {
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      include: {
        book: true,
      },
    },
  }

  const currentUserProfile = await getCurrentUserProfile({
    requireSignedIn: true,
    include,
  })

  const [decoratedUserProfile] = await decorateWithFollowing([currentUserProfile])

  const { following } = decoratedUserProfile

  if (following.length === 0) {
    return (
      <>
        <div className="sm:max-w-2xl sm:mx-auto mx-8 mt-4 -mb-4 p-4 border border-gold-500 rounded text-lg">
          This page would show the latest from your friends, but since you aren't following anyone
          yet, check out the latest from the catalog community.
        </div>

        <ExplorePageComponent />
      </>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <NotifsBanner />

      <FriendsLatestShelved />

      <div className="mt-4 mb-12 font-mulish">
        <ProfileCurrentStatus
          userProfile={currentUserProfile}
          // @ts-ignore
          userCurrentStatus={currentUserProfile.currentStatuses[0]}
          isUsersProfile
          isProfilePage={false}
        />
      </div>

      <div className="mt-4 mb-12">
        <FriendsCurrentStatuses currentUserProfile={currentUserProfile} />
      </div>

      <div className="mt-4 mb-12">
        <FriendsNotes />
      </div>

      <FriendsLists />
    </div>
  )
}
