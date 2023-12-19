import { getCurrentUserProfile } from "lib/server/auth"
import FriendsCurrentStatuses from "app/components/userCurrentStatuses/FriendsCurrentStatuses"

export const dynamic = "force-dynamic"

export default async function Home() {
  const currentUserProfile = await getCurrentUserProfile()
  const isSignedIn = !!currentUserProfile

  return isSignedIn ? (
    <main className="min-h-screen px-8 py-8">
      <FriendsCurrentStatuses currentUserProfile={currentUserProfile} />
    </main>
  ) : (
    <main className="min-h-screen px-8 py-24 flex flex-col items-center">
      <div className="text-xl my-2">for book people.</div>
      <div className="text-xl my-2">coming soon!</div>
    </main>
  )
}
