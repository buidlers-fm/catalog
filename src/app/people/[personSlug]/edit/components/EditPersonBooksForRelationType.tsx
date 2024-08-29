"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import useEditBookList from "lib/hooks/useEditBookList"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import BookCard from "app/people/[personSlug]/edit/components/EditPersonBookCard"
import EmptyState from "app/components/EmptyState"
import EditListBooks from "app/users/[username]/lists/new/components/EditListBooks"
import ConfirmationModal from "app/components/ConfirmationModal"
import PersonBookRelationType, { personBookRelationTypeCopy } from "enums/PersonBookRelationType"
import type Book from "types/Book"

const DEFAULT_CURRENT_BOOKS_LIMIT = 8
const SUGGESTED_BOOKS_LIMIT = 20
const mockList = { books: [] } as any

const allRelationTypes = Object.keys(personBookRelationTypeCopy) as PersonBookRelationType[]

function defaultSort(a, b) {
  // by first published year, descending
  if (a.firstPublishedYear === undefined) return 1
  if (b.firstPublishedYear === undefined) return -1
  return b.firstPublishedYear - a.firstPublishedYear
}

type Props = {
  person: any
  relationType?: PersonBookRelationType
  onSuccess?: () => void
  onCancel: () => void
}

export default function EditPersonBooksForRelationType({
  person,
  relationType: initialRelationType,
  onSuccess,
  onCancel,
}: Props) {
  const {
    books: currentBooks,
    setBooks: setCurrentBooks,
    addBook,
    removeBook,
  } = useEditBookList(mockList, { defaultSort })

  const [selectedRelationType, setSelectedRelationType] = useState<
    PersonBookRelationType | undefined
  >(initialRelationType)
  const [relationTypeOptions, setRelationTypeOptions] =
    useState<PersonBookRelationType[]>(allRelationTypes)

  const [listedBooks, setListedBooks] = useState<Book[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false)

  const { name, creditsByRelationType, openLibraryBooks } = person

  const isAdding = !initialRelationType

  const suggestedBooks = openLibraryBooks
    .filter((book) => !currentBooks.some((b) => b.openLibraryWorkId === book.openLibraryWorkId))
    .slice(0, SUGGESTED_BOOKS_LIMIT)

  useEffect(() => {
    if (selectedRelationType) {
      const existingBooksForRelationType = creditsByRelationType
        .find((credit) => credit.relationType === selectedRelationType)
        ?.relations.map((relation) => relation.book)

      setCurrentBooks(existingBooksForRelationType || [])

      if (selectedRelationType === PersonBookRelationType.Author) {
        const _listedBooks = person.areBooksEdited
          ? existingBooksForRelationType
          : openLibraryBooks.slice(0, DEFAULT_CURRENT_BOOKS_LIMIT)

        setListedBooks(_listedBooks)
        setCurrentBooks(_listedBooks)
      } else {
        setListedBooks(existingBooksForRelationType || [])
      }
    }
  }, [
    selectedRelationType,
    creditsByRelationType,
    openLibraryBooks,
    person.areBooksEdited,
    setCurrentBooks,
  ])

  useEffect(() => {
    const existingRelationTypes = creditsByRelationType.map((credit) => credit.relationType)
    const _relationTypeOptions = allRelationTypes.filter(
      (option) => !existingRelationTypes.includes(option),
    )
    setRelationTypeOptions(_relationTypeOptions)
  }, [creditsByRelationType])

  function handleSelectRelationType(value) {
    setSelectedRelationType(value)
  }

  async function submit(confirmed = false) {
    const deletingAllBooks = currentBooks.length === 0 && listedBooks.length > 0
    if (deletingAllBooks && !confirmed) {
      setShowDeleteAllConfirmation(true)
      return
    }

    const requestData = {
      relationType: selectedRelationType,
      books: currentBooks,
    }

    setIsSubmitting(true)

    const toastId = toast.loading("Saving your changes...")

    try {
      await api.people.updateBooks(person.id, requestData)

      toast.success(`${name}'s books updated!`, { id: toastId })

      setListedBooks(currentBooks)
      if (onSuccess) await onSuccess()
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
    <>
      <div>
        <div className="">
          {selectedRelationType ? (
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <div className="">editing {name}'s books as: </div>
                {isAdding ? (
                  <div className="sm:ml-4">
                    <SelectRelationType
                      options={relationTypeOptions}
                      defaultValue={selectedRelationType}
                      onSelect={handleSelectRelationType}
                    />
                  </div>
                ) : (
                  <span className="ml-2">{personBookRelationTypeCopy[selectedRelationType]}</span>
                )}
              </div>

              <EditListBooks
                heading=""
                books={currentBooks}
                onBookSelect={addBook}
                onBookRemove={removeBook}
                onReorder={() => {}}
                isRanked={false}
                emptyStateText="Add books using the above search field, or from the suggested books below."
                reorderEnabled={false}
              />

              <div className="flex justify-between mt-8">
                <button
                  className="cat-link text-gray-300"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  cancel
                </button>
                <button
                  className="cat-btn cat-btn-sm cat-btn-gold"
                  onClick={() => submit()}
                  disabled={isSubmitting}
                >
                  save
                </button>
              </div>

              <div className="mt-8 text-sm text-gray-300">
                <div className="mb-4">guidelines for editing a person's books:</div>
                <div className="mb-4">
                  You can add books to a person's profile by searching for them, or (for "author"
                  relation only) by clicking "+" on any suggested books below.
                </div>
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
                  If you need to add a book that isn't found in the search results or in the
                  suggested books,{" "}
                  <a
                    href="mailto:staff@catalog.fyi"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    contact us
                  </a>{" "}
                  for assistance.
                </div>
              </div>

              {selectedRelationType === PersonBookRelationType.Author && (
                <>
                  <hr className="border-[1px] border-gray-800 my-8" />

                  <div className="">
                    {suggestedBooks.length > 0 ? (
                      <>
                        <h2 className="mb-4 cat-eyebrow-uppercase">Suggested books</h2>
                        {suggestedBooks.map((book) => (
                          <BookCard
                            key={book.openLibraryWorkId}
                            book={book}
                            addBook={addBook}
                            isEditing
                          />
                        ))}
                      </>
                    ) : (
                      <EmptyState text={`No suggested books for ${name}.`} />
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="">
              <div className="">add relation type:</div>
              <SelectRelationType
                options={relationTypeOptions}
                onSelect={handleSelectRelationType}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        title="Are you sure you want to remove all books from this section?"
        onConfirm={() => {
          submit(true)
          setShowDeleteAllConfirmation(false)
        }}
        onClose={() => setShowDeleteAllConfirmation(false)}
        isOpen={showDeleteAllConfirmation}
        confirmText="yes, remove all"
      />
    </>
  )
}

function SelectRelationType({ options, defaultValue = undefined, onSelect }: any) {
  return (
    <select
      className="block mt-2 indent-1 bg-gray-900 text-white border-none rounded"
      defaultValue={defaultValue}
      onChange={(e) => !!e.target.value && onSelect(e.target.value)}
    >
      <option value="">-- select relation type --</option>

      {options.map((relationType) => {
        const displayValue = personBookRelationTypeCopy[relationType]

        return (
          <option key={relationType} value={relationType}>
            {displayValue}
          </option>
        )
      })}
    </select>
  )
}
