"use client"

import Link from "next/link"
import { useUnreads } from "lib/contexts/UnreadsContext"
import { useUser } from "lib/contexts/UserContext"
import UserProfile from "lib/models/UserProfile"

export default function UnreadsBanner() {
  const { currentUserProfile: _currentUserProfile } = useUser()
  const { hasUnreadNotifs, hasUnreadRecs } = useUnreads()

  if (!_currentUserProfile) return null

  const currentUserProfile = UserProfile.build(_currentUserProfile)

  return (
    <div className="mt-4 mb-8 text-xl font-mulish">
      Welcome back, {currentUserProfile?.name}!
      {hasUnreadNotifs && (
        <div className="mt-2 text-sm text-gray-200">
          {" You have "}
          <Link href="/inbox/notifs" className="cat-link text-gold-500">
            unread notifs
          </Link>
          .
        </div>
      )}
      {hasUnreadRecs && (
        <div className="mt-2 text-sm text-gray-200">
          {" You have "}
          <Link href="/inbox/recs" className="cat-link text-gold-500">
            new recs
          </Link>
          .
        </div>
      )}
    </div>
  )
}
