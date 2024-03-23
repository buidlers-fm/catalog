"use client"

import Link from "next/link"
import { useNotifications } from "lib/contexts/NotificationsContext"
import { useUser } from "lib/contexts/UserContext"
import UserProfile from "lib/models/UserProfile"

export default function NotifsBanner() {
  const { currentUserProfile: _currentUserProfile } = useUser()
  const { hasUnread: hasUnreadNotifs } = useNotifications()

  if (!_currentUserProfile) return null

  const currentUserProfile = UserProfile.build(_currentUserProfile)

  return (
    <div className="mt-4 mb-8 text-xl font-mulish">
      Welcome back, {currentUserProfile?.name}!
      {hasUnreadNotifs && (
        <div className="mt-2 text-sm text-gray-200">
          {" You have "}
          <Link href="/home/notifs" className="cat-link text-gold-500">
            unread notifs
          </Link>
          .
        </div>
      )}
    </div>
  )
}
