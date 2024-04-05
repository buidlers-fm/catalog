"use client"

import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"

export default function NotesIndex({ currentUserProfile }) {
  const [notes, setNotes] = useState<any[]>()

  const getBookNotes = useCallback(async () => {
    const requestData = {
      requireText: true,
      noteTypes: [BookNoteType.JournalEntry],
      sort: Sort.Recent,
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
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="mb-2 text-sm">Recent notes from around catalog.</div>
      {notes ? (
        notes.length > 0 ? (
          notes.map((note) => (
            <BookNoteCard
              key={note.id}
              note={note}
              currentUserProfile={currentUserProfile}
              onEditSuccess={getBookNotes}
              onDeleteSuccess={getBookNotes}
            />
          ))
        ) : (
          <EmptyState text="No recent notes." />
        )
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
