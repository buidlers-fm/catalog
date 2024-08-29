"use client"

import { useState, useEffect } from "react"
import { MdEdit } from "react-icons/md"
import EditPersonBooksForRelationType from "app/people/[personSlug]/edit/components/EditPersonBooksForRelationType"
import BookCard from "app/people/[personSlug]/edit/components/EditPersonBookCard"
import EmptyState from "app/components/EmptyState"
import PersonBookRelationType, { personBookRelationTypeCopy } from "enums/PersonBookRelationType"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"

export default function EditPersonBooks({ person: initialPerson }) {
  const { creditsByRelationType = [], openLibraryBooks } = initialPerson

  const [person, setPerson] = useState(initialPerson)
  const [credits, setCredits] = useState(creditsByRelationType)
  const [editingRelationType, setEditingRelationType] = useState<PersonBookRelationType>()
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [areBooksEdited, setAreBooksEdited] = useState<boolean>(initialPerson.areBooksEdited)

  useEffect(() => {
    if (creditsByRelationType.length === 0 && openLibraryBooks.length > 0 && !areBooksEdited) {
      const _credits = [
        {
          relationType: PersonBookRelationType.Author,
          relations: openLibraryBooks
            .map((book) => ({ book }))
            .sort((a, b) => {
              if (typeof a.book!.firstPublishedYear !== "number") return 1
              if (typeof b.book!.firstPublishedYear !== "number") return -1

              return b.book!.firstPublishedYear - a.book!.firstPublishedYear
            }),
        },
      ]

      setCredits(_credits)
    }
  }, [openLibraryBooks, creditsByRelationType, areBooksEdited])

  async function fetchCredits() {
    try {
      const updatedPerson = await api.people.get(initialPerson.id)
      const _credits = updatedPerson.creditsByRelationType
      setCredits(_credits)
      setPerson({
        ...person,
        ...updatedPerson,
      })
    } catch (error: any) {
      reportToSentry(error, { method: "EditPersonBooks.fetchCredits", person: initialPerson })
    }
  }

  function handleAdd() {
    setIsAdding(true)
  }

  async function handleAddSuccess() {
    setIsAdding(false)
    await fetchCredits()
    setAreBooksEdited(true)
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
      {credits.length > 0 ? (
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

                <div className="">
                  {relations.map((relation) => (
                    <BookCard
                      key={relation.book.id || relation.book.openLibraryWorkId}
                      book={relation.book}
                      addBook={() => {}}
                      isEditing={false}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState text="This person doesn't currently have any book relations." />
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
