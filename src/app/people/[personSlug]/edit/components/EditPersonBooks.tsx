"use client"

import { useState } from "react"
import { MdEdit } from "react-icons/md"
import ListBook from "app/lists/components/ListBook"
import EditPersonBooksForRelationType from "app/people/[personSlug]/edit/components/EditPersonBooksForRelationType"
import { personBookRelationTypeCopy } from "enums/PersonBookRelationType"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import type PersonBookRelationType from "enums/PersonBookRelationType"

export default function EditPersonBooks({ person }) {
  const { creditsByRelationType = [], openLibraryBooks } = person

  const [credits, setCredits] = useState(creditsByRelationType)
  const [editingRelationType, setEditingRelationType] = useState<PersonBookRelationType>()
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

  async function fetchCredits() {
    try {
      const updatedPerson = await api.people.get(person.id)
      const _credits = updatedPerson.creditsByRelationType
      setCredits(_credits)
    } catch (error: any) {
      reportToSentry(error, { method: "EditPersonBooks.fetchCredits", person })
    }
  }

  function handleAdd() {
    setIsAdding(true)
  }

  async function handleAddSuccess() {
    setIsAdding(false)
    await fetchCredits()
    // setAreBooksEdited(true)
    // setCurrentDbBooks(currentBooks)
  }

  function handleEdit(relationType: PersonBookRelationType) {
    setEditingRelationType(relationType)
  }

  async function handleEditSuccess() {
    setEditingRelationType(undefined)
    await fetchCredits()
  }

  return (
    <div className="">
      Edit book relations for {person.name}.
      {credits.length > 0 && (
        <div className="">
          {credits.map(({ relationType, relations }) => {
            if (!relations || relations.length === 0) return null

            if (editingRelationType === relationType) {
              return (
                <EditPersonBooksForRelationType
                  key={relationType}
                  person={person}
                  relationType={relationType}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditingRelationType(undefined)}
                />
              )
            }

            return (
              <div key={relationType} className="my-6">
                <div className="flex justify-between items-center">
                  <div className="cat-eyebrow">{personBookRelationTypeCopy[relationType]}</div>

                  <button className="" onClick={() => handleEdit(relationType)}>
                    <MdEdit className="m-1 text-lg text-gray-300" />
                  </button>
                </div>
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
      {!isAdding && !editingRelationType && (
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
