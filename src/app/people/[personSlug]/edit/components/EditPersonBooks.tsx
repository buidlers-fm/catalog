"use client"

import Link from "next/link"
import { useState } from "react"
import useEditBookList from "lib/hooks/useEditBookList"
import { getBookLinkAgnostic } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"
import EmptyState from "app/components/EmptyState"
import EditListBooks from "app/users/[username]/lists/new/components/EditListBooks"

const BOOKS_LIMIT = 20
const mockList = { books: [] } as any

export default function EditPersonBooks({ person }) {
  const { books: currentBooks, addBook, removeBook, reorderBooks } = useEditBookList(mockList)

  const [isEditing, setIsEditing] = useState(false)

  const { name, books: allBooks } = person

  const suggestedBooks = allBooks.slice(0, BOOKS_LIMIT)

  return (
    <div>
      <div className="">
        {isEditing ? (
          <div className="mb-16">
            <EditListBooks
              heading={`editing ${name}'s books`}
              books={currentBooks}
              onBookSelect={addBook}
              onBookRemove={removeBook}
              onReorder={reorderBooks}
              isRanked={false}
            />

            <div className="mt-8 text-sm text-gray-300">
              <div className="mb-4">guidelines for editing a person's books:</div>
              <div className="mb-4">
                Once a person's books have been manually edited (and saved) for the first time,
                their books will no longer be automatically populated or updated from OpenLibrary.
                They will always need to be manually updated.
              </div>
              <div className="mb-4">
                There is no limit to the number of books that can be added to a person's profile
                (unlike with auto-populated books).
              </div>
              <div className="mb-4">
                To edit an individual book's details, click the "edit book" button on the book's
                card. This will open in a new tab so as not to interfere with your current editing
                session. (Still, it's recommended to finish and save your edits here first, before
                going to other tabs to edit the book details.)
              </div>
              <div className="mb-4">
                If you need to add a book that isn't found in the search results or in the suggested
                books,{" "}
                <a
                  href="mailto:staff@catalog.fyi"
                  className="cat-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  contact us
                </a>{" "}
                for assistance.
              </div>
            </div>
            <button
              className="cat-btn cat-btn-sm cat-btn-red-outline"
              onClick={() => setIsEditing(false)}
            >
              cancel
            </button>
          </div>
        ) : (
          <button
            className="mb-8 cat-btn cat-btn-sm cat-btn-gold"
            onClick={() => setIsEditing(true)}
          >
            edit books
          </button>
        )}
      </div>

      <div className="">
        {suggestedBooks.length > 0 ? (
          <>
            {isEditing && <h2 className="mb-4 cat-eyebrow-uppercase">Suggested books</h2>}
            {suggestedBooks.map((book) => (
              <SuggestedBookCard key={book.openLibraryWorkId} book={book} />
            ))}
          </>
        ) : (
          <EmptyState text={`No books found for ${name}.`} />
        )}
      </div>
    </div>
  )
}

function SuggestedBookCard({ book }) {
  const { id, openLibraryWorkId, coverImageUrl, title, editionsCount, firstPublishedYear } = book

  const idForAnchor = id || openLibraryWorkId

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        <div id={`book-${idForAnchor}`} className="w-16 mr-6 shrink-0">
          <div className="relative group">
            <Link href={getBookLinkAgnostic(book)}>
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="cover"
                  className="w-full mx-auto shadow-md rounded-xs"
                />
              ) : (
                <CoverPlaceholder size="sm" />
              )}
            </Link>

            <BookCoverOverlay book={book} positionClass="bottom-1" />
          </div>
        </div>

        <BookTooltip book={book} anchorSelect={`#book-${idForAnchor}`} />

        <div className="grow">
          <Link href={getBookLinkAgnostic(book)}>{title}</Link>
          <div className="text-gray-300">
            {editionsCount} editions • {firstPublishedYear}
          </div>
        </div>
      </div>
    </div>
  )
}
