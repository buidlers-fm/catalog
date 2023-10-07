"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import Search from "app/components/nav/Search"
import SortableBook from "app/lists/new/components/SortableBook"
import type Book from "types/Book"

type Props = {
  books: Book[]
  onBookSelect: (book: Book) => void
  onBookRemove: (book: Book) => void
  onReorder: (reorderedIds: string[]) => void
}

export default function EditListBooks({ books, onBookSelect, onBookRemove, onReorder }: Props) {
  const [bookIds, setBookIds] = useState<string[]>([])

  useEffect(() => {
    setBookIds(books.map((b) => b.openlibraryWorkId!))
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

  return (
    <>
      <div className="mt-8 mb-4 text-xl">Books</div>
      <Search isNav={false} onSelect={onBookSelect} />
      <div className="mt-6 mb-2">
        {books.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={bookIds} strategy={verticalListSortingStrategy}>
              <ul>
                {books.map((book) => (
                  <SortableBook
                    key={book.openlibraryWorkId}
                    id={book.openlibraryWorkId}
                    book={book}
                    onRemove={onBookRemove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="h-32 p-6 flex items-center justify-center border border-gray-700 rounded">
            Add some books using the above search field.
          </div>
        )}
      </div>
    </>
  )
}
