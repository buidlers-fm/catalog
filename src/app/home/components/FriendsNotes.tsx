"use client"

import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { useUser } from "lib/contexts/UserContext"
import { reportToSentry } from "lib/sentry"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"

const LIMIT = 5

export default function FriendsNotes() {
  const { currentUserProfile } = useUser()

  const [notes, setNotes] = useState<any[]>()

  const getBookNotes = useCallback(async () => {
    const requestData = {
      following: true,
      requireText: true,
      noteTypes: [BookNoteType.JournalEntry],
      sort: Sort.Recent,
      limit: LIMIT,
    }

    try {
      const _updatedNotes = await api.bookNotes.get(requestData)

      setNotes(_updatedNotes)
    } catch (error: any) {
      reportToSentry(error, {
        ...requestData,
        currentUserProfile,
      })
    }
  }, [currentUserProfile])

  useEffect(() => {
    getBookNotes()
  }, [getBookNotes])

  return (
    <div className="mt-4 font-mulish">
      <div className="cat-eyebrow">friends' recent notes</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      {notes ? (
        notes.length > 0 ? (
          notes.map((note) => (
            <BookNoteCard
              key={note.id}
              note={note}
              currentUserProfile={currentUserProfile || undefined}
              onEditSuccess={() => {}}
              onDeleteSuccess={() => {}}
            />
          ))
        ) : (
          <EmptyState text="Your friends haven't published any notes recently." />
        )
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
