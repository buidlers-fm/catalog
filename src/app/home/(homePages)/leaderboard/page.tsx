import { getUserProfilesByDistinctBooksEdited } from "lib/server/leaderboard"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import EmptyState from "app/components/EmptyState"
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
  const leaders = await getUserProfilesByDistinctBooksEdited(LIMIT)

  return (
    <div className="mt-4 max-w-xl mx-auto font-mulish">
      <div className="mb-2 text-sm">
        Users who have edited the greatest number of different books. To get on this leaderboard,
        fill in or fix the details or the covers of some books you care about!
      </div>
      <div className="mt-6">
        {leaders.length === 0 ? (
          <EmptyState text="No one has edited a book yet." />
        ) : (
          <table className="w-full bg-gray-900 rounded">
            <thead>
              <tr className="text-sm font-bold">
                <th className="w-1/6 px-3 py-3 text-left">rank</th>
                <th className="px-3 py-3 text-left">user</th>
                <th className="w-1/4 px-3 py-3 text-left">books edited</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map(({ userProfile, bookCount }, index) => (
                <tr
                  key={userProfile.id}
                  className={`text-sm ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}
                >
                  <td className="w-1/6 px-3 py-1">{index + 1}</td>
                  <td className="px-3 py-1">
                    <NameWithAvatar userProfile={userProfile} />
                  </td>
                  <td className="w-1/4 px-3 py-1">{bookCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
