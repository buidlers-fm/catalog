"use client"

import { useState, useEffect } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"

export default function UserBookNotesIndex({ userProfile, currentUserProfile }) {
  const [notes, setNotes] = useState<any[]>()

  useEffect(() => {
    const _notes = (userProfile.bookNotes || []).filter(
      (note) => note.noteType === BookNoteType.JournalEntry && !!note.text,
    )

    setNotes(_notes)
  }, [userProfile.bookNotes])

  async function getBookNotes() {
    const requestData = {
      userProfileId: userProfile.id,
      requireText: true,
      noteTypes: [BookNoteType.JournalEntry],
    }

    try {
      const _notes = await api.bookNotes.get(requestData)

      setNotes(_notes)
    } catch (error: any) {
      reportToSentry(error, {
        ...requestData,
        currentUserProfile,
      })
    }
  }

  const isUsersProfile = currentUserProfile?.id === userProfile.id

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="mt-8">
        {notes ? (
          notes.length > 0 ? (
            <div className="">
              {notes.map((note) => (
                <BookNoteCard
                  key={note.id}
                  note={note}
                  currentUserProfile={currentUserProfile}
                  onEditSuccess={getBookNotes}
                  onDeleteSuccess={getBookNotes}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              text={`${
                isUsersProfile ? "You haven't" : `${userProfile.username} hasn't`
              } written any notes
              yet.`}
            />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
