"use client"

import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { useUser } from "lib/contexts/UserContext"
import { reportToSentry } from "lib/sentry"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"

const LIMIT = 5

export default function FriendsLists() {
  const { currentUserProfile } = useUser()

  const [lists, setLists] = useState<any[]>()

  const getLists = useCallback(async () => {
    const requestData = {
      following: true,
      limit: LIMIT,
    }

    try {
      const _lists = await api.lists.get(requestData)
      setLists(_lists)
    } catch (error: any) {
      reportToSentry(error, {
        method: "FriendsLists.getLists",
        currentUserProfile,
      })
    }
  }, [currentUserProfile])

  useEffect(() => {
    getLists()
  }, [getLists])

  return (
    <div className="mt-4 font-mulish">
      <div className="cat-eyebrow">friends' recent lists</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      {lists ? (
        lists.length > 0 ? (
          lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              currentUserProfile={currentUserProfile}
              withByline
            />
          ))
        ) : (
          <EmptyState text="Your friends haven't created any lists recently." />
        )
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
