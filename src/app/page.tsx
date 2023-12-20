import { getCurrentUserProfile } from "lib/server/auth"
import FriendsCurrentStatuses from "app/components/userCurrentStatuses/FriendsCurrentStatuses"
import LandingPage from "app/components/homepage/LandingPage"

export const dynamic = "force-dynamic"

export default async function Home() {
  const currentUserProfile = await getCurrentUserProfile()
  const isSignedIn = !!currentUserProfile

  return isSignedIn ? (
    <div className="min-h-screen px-16 py-8">
      <FriendsCurrentStatuses currentUserProfile={currentUserProfile} />
    </div>
  ) : (
    <LandingPage />
  )
}
