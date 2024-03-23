"use client"

import Link from "next/link"
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
    <div className="mt-8 max-w-xl mx-auto font-mulish">
      <div className="cat-page-title mb-4">
        <Link href="/home" className="cat-link">
          home
        </Link>
        {" / "}notifs
      </div>

      <hr className="my-1 h-[1px] border-none bg-gray-300" />

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
