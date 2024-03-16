"use client"

import { useState, useEffect } from "react"
import api from "lib/api"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"

export default function Leaderboard({ limit }) {
  const [leaders, setLeaders] = useState<any[]>()

  useEffect(() => {
    async function getLeaders() {
      const _leaders = await api.leaderboard.get({ limit })
      setLeaders(_leaders)
    }
    getLeaders()
  }, [limit])

  return (
    <div className="mt-4 max-w-xl mx-auto font-mulish">
      <div className="mb-2 text-sm">
        To get on this leaderboard, fill in or fix the details or the covers of some books you care
        about!
      </div>
      {leaders ? (
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
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
