import Link from "next/link"
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
        <div className="mt-4 mb-8 p-4 border-[1px] border-gold-200 font-mulish rounded-sm">
          Happy New Year! 🎉📚 Check out everyone's{" "}
          <Link href="/home/lists/favorites-2023" className="cat-btn-link">
            favorites of 2023
          </Link>{" "}
          and{" "}
          <Link href="/home/lists/to-read-in-2024" className="cat-btn-link">
            to read in 2024
          </Link>{" "}
          lists from around the catalog community.
        </div>
        <HomeTabs />
      </div>
      {children}
    </div>
  )
}
