"use client"

import { useState } from "react"
import ListBook from "app/lists/components/ListBook"
import EditPersonBooksForRelationType from "app/people/[personSlug]/edit/components/EditPersonBooksForRelationType"
import { personBookRelationTypeCopy } from "enums/PersonBookRelationType"
// import api from "lib/api"
// import { reportToSentry } from "lib/sentry"

export default function EditPersonBooks({ person }) {
  const { creditsByRelationType: credits = [], openLibraryBooks } = person

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isAdding, setIsAdding] = useState<boolean>(false)

  // const [areBooksEdited, setAreBooksEdited] = useState(person.areBooksEdited)
  // const [currentDbBooks, setCurrentDbBooks] = useState<Book[]>(dbBooks)
  // // reset books when exiting editing mode?
  // useEffect(() => {
  //   const defaultBooks = areBooksEdited
  //     ? currentDbBooks
  //     : openLibraryBooks.slice(0, DEFAULT_CURRENT_BOOKS_LIMIT)
  //   if (!isEditing) {
  //     setCurrentBooks(defaultBooks)
  //   }
  // }, [isEditing, setCurrentBooks, currentDbBooks, areBooksEdited, openLibraryBooks])

  // async function fetchAdaptations() {
  //   try {
  //     const fetchedAdaptations = await api.adaptations.get(book.id)
  //     setAdaptations(fetchedAdaptations)
  //   } catch (error: any) {
  //     reportToSentry(error, { method: "EditBookAdaptations.fetchAdaptations", book })
  //   }
  // }

  function handleAdd() {
    setIsAdding(true)
  }

  function handleAddSuccess() {
    setIsAdding(false)
    // setAreBooksEdited(true)
    // setCurrentDbBooks(currentBooks)
    // fetchAdaptations()
  }

  // function handleEditSuccess() {
  //   setIsEditing(false)
  //   // fetchAdaptations()
  // }

  return (
    <div className="">
      Edit book relations for {person.name}.
      {credits.length > 0 && (
        <div className="">
          {credits.map(({ relationType, relations }) => {
            if (!relations || relations.length === 0) return null

            return (
              <div key={relationType} className="my-6">
                <div className="cat-eyebrow">{personBookRelationTypeCopy[relationType]}</div>
                <hr className="mt-0.5 h-[1px] border-none bg-gray-300" />

                <div className="p-0 grid grid-cols-4 sm:gap-[28px]">
                  {relations.map((relation) => (
                    <ListBook key={relation.id} book={relation.book} detail={relation.detail} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {isAdding && (
        <EditPersonBooksForRelationType
          person={person}
          onSuccess={handleAddSuccess}
          onCancel={() => setIsAdding(false)}
        />
      )}
      {!isAdding && !isEditing && (
        <div className="flex items-center">
          <button
            type="button"
            className="block cat-btn cat-btn-sm cat-btn-gold my-4"
            onClick={handleAdd}
          >
            + add relation type
          </button>
          <div className="ml-4 text-gray-300 text-sm">(e.g. author, editor, agent)</div>
        </div>
      )}
    </div>
  )
}
