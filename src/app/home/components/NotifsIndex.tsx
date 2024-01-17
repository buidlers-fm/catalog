"use client"

import { useEffect } from "react"
import { useNotifications } from "lib/contexts/NotificationsContext"
import NotifCard from "app/components/notifs/NotifCard"
import EmptyState from "app/components/EmptyState"

export default function NotifsIndex({ notifs, currentUserProfile }) {
  const { markAllAsRead } = useNotifications()

  useEffect(() => {
    markAllAsRead()
  }, [markAllAsRead])

  return (
    <div className="max-w-xl mx-auto font-mulish">
      {notifs.length > 0 ? (
        notifs.map((notif) => (
          <NotifCard key={notif.id} notif={notif} currentUserProfile={currentUserProfile} />
        ))
      ) : (
        <EmptyState text="You don't have any notifications." />
      )}
    </div>
  )
}
