import { getCurrentUserProfile } from "lib/server/auth"
import FriendsLatestShelved from "app/home/components/FriendsLatestShelved"
import FriendsCurrentStatuses from "app/components/userCurrentStatuses/FriendsCurrentStatuses"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "catalog • home",
  openGraph: {
    title: "catalog • home",
  },
}

export default async function HomePage() {
  const currentUserProfile = await getCurrentUserProfile()

  return (
    <div>
      <FriendsLatestShelved />
      <FriendsCurrentStatuses currentUserProfile={currentUserProfile} />
    </div>
  )
}
