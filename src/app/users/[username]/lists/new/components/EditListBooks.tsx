"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import Search from "app/components/nav/Search"
import SortableBook from "app/users/[username]/lists/new/components/SortableBook"
import type Book from "types/Book"

type Props = {
  heading: string
  books: Book[]
  onBookSelect: (book: Book) => void
  onBookRemove: (book: Book) => void
  onReorder: (reorderedIds: string[]) => void
  limit?: number
  isRanked: boolean
  reorderEnabled?: boolean
  notesEnabled?: boolean
  bookIdsToNotes?: any
  onBookNoteChange?: (openLibraryWorkId: string, note: string) => void
  emptyStateText?: string
}

const DEFAULT_EMPTY_STATE_TEXT = "Add some books using the above search field."

export default function EditListBooks({
  heading,
  books,
  onBookSelect,
  onBookRemove,
  onReorder,
  limit,
  isRanked,
  reorderEnabled = true,
  notesEnabled = false,
  bookIdsToNotes = {},
  onBookNoteChange = () => {},
  emptyStateText = DEFAULT_EMPTY_STATE_TEXT,
}: Props) {
  const [bookIds, setBookIds] = useState<string[]>([])

  useEffect(() => {
    setBookIds(books.map((b) => b.openLibraryWorkId!))
  }, [books])

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = bookIds.indexOf(active.id)
      const newIndex = bookIds.indexOf(over.id)

      const reorderedBookIds = arrayMove(bookIds, oldIndex, newIndex)

      setBookIds(reorderedBookIds)
      onReorder(reorderedBookIds)
    }
  }

  // @ts-ignore
  const disabled = Number.isFinite(limit) && books.length >= limit
  const disabledMessage = `This list can have up to ${limit} books.`

  return (
    <>
      <div className="mt-8 mb-4 text-xl">{heading}</div>
      <Search
        isNav={false}
        onSelect={onBookSelect}
        disabled={disabled}
        disabledMessage={disabledMessage}
      />
      <div className="mt-6 mb-2">
        {books.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={bookIds} strategy={verticalListSortingStrategy}>
              <ul>
                {books.map((book, index) => (
                  <SortableBook
                    key={book.openLibraryWorkId}
                    id={book.openLibraryWorkId}
                    book={book}
                    onRemove={onBookRemove}
                    isRanked={isRanked}
                    rank={index + 1}
                    reorderEnabled={reorderEnabled}
                    notesEnabled={notesEnabled}
                    note={bookIdsToNotes[book.openLibraryWorkId]}
                    onNoteChange={onBookNoteChange}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="h-32 p-6 flex items-center justify-center border border-gray-700 rounded">
            {emptyStateText}
          </div>
        )}
      </div>
    </>
  )
}
