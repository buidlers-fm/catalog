"use client"

import { useEffect } from "react"
import { useUnreads } from "lib/contexts/UnreadsContext"
import NotifCard from "app/components/notifs/NotifCard"
import EmptyState from "app/components/EmptyState"

export default function NotifsIndex({ notifs, currentUserProfile }) {
  const { markAllNotifsAsRead } = useUnreads()

  useEffect(() => {
    markAllNotifsAsRead()
  }, [markAllNotifsAsRead])

  return (
    <div className="mt-8 mx-8 max-w-xl sm:mx-auto font-mulish">
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
