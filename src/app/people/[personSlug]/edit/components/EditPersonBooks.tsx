"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import useEditBookList from "lib/hooks/useEditBookList"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getBookLinkAgnostic, getBookEditLinkAgnostic } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"
import EmptyState from "app/components/EmptyState"
import EditListBooks from "app/users/[username]/lists/new/components/EditListBooks"

const BOOKS_LIMIT = 20
const mockList = { books: [] } as any

function defaultSort(a, b) {
  // by first published year, descending
  if (a.firstPublishedYear === undefined) return 1
  if (b.firstPublishedYear === undefined) return -1
  return b.firstPublishedYear - a.firstPublishedYear
}

export default function EditPersonBooks({ person }) {
  const {
    books: currentBooks,
    setBooks: setCurrentBooks,
    addBook,
    removeBook,
  } = useEditBookList(mockList, { defaultSort })

  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { name, books: allBooks } = person

  const suggestedBooks = allBooks
    .filter((book) => !currentBooks.some((b) => b.id === book.id))
    .slice(0, BOOKS_LIMIT)

  // reset books when exiting editing mode
  useEffect(() => {
    if (!isEditing) {
      setCurrentBooks([])
    }
  }, [isEditing, setCurrentBooks])

  async function submit() {
    const requestData = {
      books: currentBooks,
    }

    setIsSubmitting(true)

    const toastId = toast.loading("Saving your changes...")

    try {
      await api.people.updateBooks(person.id, requestData)

      toast.success(`${name}'s books updated!`, { id: toastId })

      setIsEditing(false)
    } catch (error) {
      toast.error("Hmm, something went wrong.", { id: toastId })

      reportToSentry(error, {
        method: "EditPersonBooks.submit",
        ...requestData,
      })
    }

    setIsSubmitting(false)
  }

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
              onReorder={() => {}}
              isRanked={false}
              emptyStateText="Add books using the above search field, or from the suggested books below."
              reorderEnabled={false}
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
                Books will always be in order of first published year, descending.
              </div>
              <div className="mb-4">
                To edit an individual book's details (including first published year), exit this
                editing session by either saving your changes or clicking "cancel", then click the
                "edit book" button on the book's card. This will open in a new tab.
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
            <div className="flex justify-between mt-8">
              <button
                className="cat-link text-gray-300"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                cancel
              </button>
              <button
                className="cat-btn cat-btn-sm cat-btn-gold"
                onClick={submit}
                disabled={isSubmitting}
              >
                save
              </button>
            </div>
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

      {isEditing && <hr className="border-[1px] border-gray-800 my-8" />}

      <div className="">
        {suggestedBooks.length > 0 ? (
          <>
            {isEditing && <h2 className="mb-4 cat-eyebrow-uppercase">Suggested books</h2>}
            {suggestedBooks.map((book) => (
              <SuggestedBookCard
                key={book.openLibraryWorkId}
                book={book}
                addBook={addBook}
                isEditing={isEditing}
              />
            ))}
          </>
        ) : (
          <EmptyState text={`No books found for ${name}.`} />
        )}
      </div>
    </div>
  )
}

function SuggestedBookCard({ book, addBook, isEditing }) {
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

        {isEditing ? (
          <div className="flex items-center">
            <button className="cat-btn cat-btn-sm cat-btn-gold" onClick={() => addBook(book)}>
              +
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <Link
              href={getBookEditLinkAgnostic(book)}
              target="_blank"
              className="cat-link text-sm text-gray-300"
            >
              edit book
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
