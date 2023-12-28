import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import FriendsCurrentStatuses from "app/components/userCurrentStatuses/FriendsCurrentStatuses"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const currentUserProfile = await getCurrentUserProfile()
  const isSignedIn = !!currentUserProfile

  if (!isSignedIn) redirect("/")

  return (
    <div className="min-h-screen px-16 py-8">
      <FriendsCurrentStatuses currentUserProfile={currentUserProfile} />
    </div>
  )
}
