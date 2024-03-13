import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import LandingPage from "app/components/homepage/LandingPage"

export const dynamic = "force-dynamic"

export default async function RootPage() {
  const currentUserProfile = await getCurrentUserProfile()

  if (currentUserProfile) redirect("/home")

  return <LandingPage />
}
