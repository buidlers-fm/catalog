"use client"

import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react"
import api from "lib/api"
import { useUser } from "lib/contexts/UserContext"
import RecommendationStatus from "enums/RecommendationStatus"

type UnreadsProviderValue = {
  hasUnreadNotifs: boolean
  fetchNotifs: () => Promise<void>
  markAllNotifsAsRead: () => Promise<void>
  hasUnreadRecs: boolean
  fetchRecs: () => Promise<void>
  markAllRecsAsRead: () => Promise<void>
}

export const UnreadsContext = createContext<UnreadsProviderValue | undefined>(undefined)

export const UnreadsProvider = ({ children }) => {
  const { currentUser } = useUser()
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false)
  const [hasUnreadRecs, setHasUnreadRecs] = useState(false)

  const fetchNotifs = useCallback(async () => {
    const unreadNotifs = await api.notifs.getUnread()
    setHasUnreadNotifs(unreadNotifs && unreadNotifs.length > 0)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    fetchNotifs()
  }, [fetchNotifs, currentUser])

  const markAllNotifsAsRead = useCallback(async () => {
    await api.notifs.markAllAsRead()
    setHasUnreadNotifs(false)
  }, [])

  const fetchRecs = useCallback(async () => {
    const unreadRecs = await api.recommendations.get({ status: RecommendationStatus.New })
    setHasUnreadRecs(unreadRecs && unreadRecs.length > 0)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    fetchRecs()
  }, [fetchRecs, currentUser])

  const markAllRecsAsRead = useCallback(async () => {
    await api.recommendations.markAllAsRead()
    setHasUnreadRecs(false)
  }, [])

  const providerValue = useMemo(
    () => ({
      hasUnreadNotifs,
      fetchNotifs,
      markAllNotifsAsRead,
      hasUnreadRecs,
      fetchRecs,
      markAllRecsAsRead,
    }),
    [
      hasUnreadNotifs,
      fetchNotifs,
      markAllNotifsAsRead,
      hasUnreadRecs,
      fetchRecs,
      markAllRecsAsRead,
    ],
  )

  return <UnreadsContext.Provider value={providerValue}>{children}</UnreadsContext.Provider>
}

export function useUnreads() {
  const context = useContext(UnreadsContext)
  if (context === undefined) {
    throw new Error("useUnreads must be used within an UnreadsProvider")
  }
  return context
}
