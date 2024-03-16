import Link from "next/link"
import Leaderboard from "app/explore/components/Leaderboard"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "leaderboard • catalog",
  openGraph: {
    title: "leaderboard • catalog",
  },
}

const LIMIT = 100

export default async function LeaderboardPage() {
  return (
    <div className="mt-4 max-w-xl mx-auto font-mulish">
      <div className="cat-page-title mb-4">
        <Link href="/explore" className="cat-link">
          explore
        </Link>
        {" / "}leaderboard
      </div>

      <Leaderboard limit={LIMIT} />
    </div>
  )
}
