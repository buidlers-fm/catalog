import Link from "next/link"
import { getCurrentUserProfile } from "lib/server/auth"
import HomeTabs from "app/home/components/HomeTabs"

export const dynamic = "force-dynamic"

export default async function HomeLayout({ children }) {
  await getCurrentUserProfile({ requireSignedIn: true })

  return (
    <div className="px-8 sm:px-16 py-8">
      <div className="mt-4 mb-8 max-w-xl mx-auto text-lg">
        Check out the new{" "}
        <Link href="/explore" className="cat-link text-gold-500">
          explore
        </Link>{" "}
        page for featured new books and the latest from the catalog community.
      </div>
      <div className="mt-4 mb-12 max-w-xl mx-auto">
        <HomeTabs />
      </div>
      {children}
    </div>
  )
}
