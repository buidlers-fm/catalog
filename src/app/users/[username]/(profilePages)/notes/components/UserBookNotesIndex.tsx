"use client"

import { useState, useEffect } from "react"
import api from "lib/api"
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
    try {
      const _notes = await api.bookNotes.get({
        userProfileId: userProfile.id,
        requireText: true,
        noteTypes: [BookNoteType.JournalEntry],
      })

      setNotes(_notes)
    } catch (error: any) {
      console.log(error)
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
