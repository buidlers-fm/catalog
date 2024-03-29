"use client"

import { useState, useEffect, useCallback } from "react"
import { useUnreads } from "lib/contexts/UnreadsContext"
import api from "lib/api"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import RecCard from "app/inbox/components/RecCard"
import RecommendationStatus from "enums/RecommendationStatus"
import type Recommendation from "types/Recommendation"

const defaultRecsByStatus: { [key: string]: Recommendation[] } = {
  [RecommendationStatus.New]: [],
  [RecommendationStatus.Open]: [],
  [RecommendationStatus.Accepted]: [],
  [RecommendationStatus.Dismissed]: [],
}

export default function RecsIndex() {
  const { markAllRecsAsRead } = useUnreads()

  const [recs, setRecs] = useState<Recommendation[]>()
  const [recsByStatus, setRecsByStatus] = useState(defaultRecsByStatus)

  const fetchRecs = useCallback(async () => {
    const _recs = await api.recommendations.get()
    setRecs(_recs)

    if (!_recs) return

    const defaultRecsByStatusClone = JSON.parse(JSON.stringify(defaultRecsByStatus))

    const _recsByStatus = _recs.reduce((acc, rec) => {
      const { status } = rec

      acc[status].push(rec)

      return acc
    }, defaultRecsByStatusClone)

    setRecsByStatus(_recsByStatus)

    markAllRecsAsRead()
  }, [markAllRecsAsRead])

  useEffect(() => {
    fetchRecs()
  }, [fetchRecs])

  if (!recs) {
    return <LoadingSection />
  }

  if (recs.length === 0) {
    return <EmptyState text="You don't have any recommendations yet." />
  }

  return (
    <>
      <div className="mt-4 mb-4 text-gray-200 text-sm">
        Accepting a rec adds it to your "to read" shelf. Dismissing it moves it to the "dismissed"
        section of your recs. The recommender won't be notified of either action.
      </div>

      <hr className="my-1 h-[1px] border-none bg-gray-300" />

      {recsByStatus[RecommendationStatus.New].length === 0 && (
        <div className="mt-12 mb-12">No new recs.</div>
      )}

      {Object.entries(recsByStatus).map(([status, recsForStatus]) => {
        if (recsForStatus.length === 0) return null

        return (
          <div key={status} className="mt-4 mb-12">
            <div className="">{status}</div>
            <hr className="my-1 h-[1px] border-none bg-gray-300" />

            {recsForStatus.map((rec) => (
              <RecCard key={rec.id} rec={rec} onChange={fetchRecs} />
            ))}
          </div>
        )
      })}
    </>
  )
}
