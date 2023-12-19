"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getBookLink } from "lib/helpers/general"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"

export default function BookNotesIndex({ book, currentUserProfile }) {
  const [notes, setNotes] = useState<any[]>()

  const getBookNotes = useCallback(async () => {
    const requestData = {
      bookId: book.id,
      requireText: true,
      noteTypes: [BookNoteType.JournalEntry],
      sort: Sort.Popular,
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
  }, [book.id, currentUserProfile])

  useEffect(() => {
    getBookNotes()
  }, [getBookNotes])

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-eyebrow">Notes on</div>
      <Link href={getBookLink(book.slug)}>
        <h1 className="my-2 text-4xl font-semibold font-newsreader">{book.title}</h1>
      </Link>
      <div className="mt-4">
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
            <EmptyState text="No notes yet." />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
