"use client"

import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"
import api from "lib/api"

type NotificationsProviderValue = {
  hasUnread: boolean
  fetchNotifs: () => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const NotificationsContext = createContext<NotificationsProviderValue | undefined>(undefined)

export const NotificationsProvider = ({ children }) => {
  const [hasUnread, setHasUnread] = useState(false)

  const fetchNotifs = useCallback(async () => {
    const unreadNotifs = await api.notifs.getUnread()
    setHasUnread(unreadNotifs && unreadNotifs.length > 0)
  }, [])

  useEffect(() => {
    fetchNotifs()
  }, [fetchNotifs])

  const markAllAsRead = useCallback(async () => {
    await api.notifs.markAllAsRead()
    setHasUnread(false)
  }, [])

  const providerValue = useMemo(
    () => ({ hasUnread, fetchNotifs, markAllAsRead }),
    [hasUnread, fetchNotifs, markAllAsRead],
  )

  return (
    <NotificationsContext.Provider value={providerValue}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
