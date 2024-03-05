"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getUserBookNotesLink } from "lib/helpers/general"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import BookNoteType from "enums/BookNoteType"

const BOOK_NOTES_LIMIT = 3

export default function BookNotes({ userProfile, currentUserProfile }: any) {
  const [notes, setNotes] = useState<any[]>([])

  const getBookNotes = useCallback(async () => {
    const requestData = {
      userProfileId: userProfile.id,
      limit: BOOK_NOTES_LIMIT,
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
  }, [currentUserProfile, userProfile.id])

  useEffect(() => {
    getBookNotes()
  }, [getBookNotes, userProfile.id])

  return (
    notes.length > 0 && (
      <div className="mt-8 font-mulish">
        <div className="flex justify-between text-gray-300 text-sm">
          <div className="cat-eyebrow">Recent notes</div>
          <div className="flex -mt-1">
            <Link
              className="inline-block mt-1 mx-2"
              href={getUserBookNotesLink(userProfile.username)}
            >
              more
            </Link>
          </div>
        </div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
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
      </div>
    )
  )
}
