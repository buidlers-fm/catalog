"use client"

import { useState, useEffect } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import UserProfile from "lib/models/UserProfile"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"

export default function UserBookNotesIndex({ userProfile: _userProfile, currentUserProfile }) {
  const [notes, setNotes] = useState<any[]>()

  const userProfile = UserProfile.build(_userProfile)

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

  let emptyStateText
  if (isUsersProfile) {
    emptyStateText = "You haven't written any notes yet. To write a note, visit a book's page."
  } else {
    emptyStateText = `${userProfile.name} hasn't written any notes yet.`
  }

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
            <EmptyState text={emptyStateText} />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
