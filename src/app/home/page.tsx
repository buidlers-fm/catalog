import { getCurrentUserProfile } from "lib/server/auth"
import FriendsCurrentStatuses from "app/components/userCurrentStatuses/FriendsCurrentStatuses"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const currentUserProfile = await getCurrentUserProfile()

  return <FriendsCurrentStatuses currentUserProfile={currentUserProfile} />
}
