import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import HomeTabs from "app/home/components/HomeTabs"

export const dynamic = "force-dynamic"

export default async function HomeLayout({ children }) {
  const currentUserProfile = await getCurrentUserProfile()
  const isSignedIn = !!currentUserProfile

  if (!isSignedIn) redirect("/")

  return (
    <div className="px-8 sm:px-16 py-8">
      <div className="mt-4 mb-12 max-w-xl mx-auto">
        <HomeTabs />
      </div>
      {children}
    </div>
  )
}
