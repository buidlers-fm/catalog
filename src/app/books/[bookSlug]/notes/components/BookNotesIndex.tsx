"use client"

import { useState, useEffect } from "react"
import api from "lib/api"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import BookNoteType from "enums/BookNoteType"

export default function BookNotesIndex({ book, currentUserProfile }) {
  const [notes, setNotes] = useState<any[]>()

  useEffect(() => {
    const _notes = (book.bookNotes || []).filter(
      (note) => note.noteType === BookNoteType.JournalEntry && !!note.text,
    )

    setNotes(_notes)
  }, [book.bookNotes])

  async function getBookNotes() {
    try {
      const _notes = await api.bookNotes.get({
        noteType: BookNoteType.JournalEntry,
        bookId: book.id,
        requireText: true,
      })

      setNotes(_notes)
    } catch (error: any) {
      console.log(error)
    }
  }

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-eyebrow">Notes on</div>
      <h1 className="my-2 text-4xl font-semibold font-newsreader">{book.title}</h1>
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
            <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
              No notes yet.
            </div>
          )
        ) : (
          <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}
