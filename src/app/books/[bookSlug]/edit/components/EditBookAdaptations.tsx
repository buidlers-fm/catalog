"use client"

import { useState } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import EditAdaptation from "app/books/[bookSlug]/edit/components/EditAdaptation"
import AdaptationCard from "app/components/AdaptationCard"

export default function EditBookAdaptations({ book }) {
  const [adaptations, setAdaptations] = useState(book.adaptations)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isAdding, setIsAdding] = useState<boolean>(false)

  async function fetchAdaptations() {
    try {
      const fetchedAdaptations = await api.adaptations.get(book.id)
      setAdaptations(fetchedAdaptations)
    } catch (error: any) {
      reportToSentry(error, { method: "EditBookAdaptations.fetchAdaptations", book })
    }
  }

  function handleAdd() {
    setIsAdding(true)
  }

  function handleAddSuccess() {
    setIsAdding(false)
    fetchAdaptations()
  }

  function handleEditSuccess() {
    setIsEditing(false)
    fetchAdaptations()
  }

  return (
    <div className="">
      Add or remove TV/movie adaptations of {book.title} by {book.authorName}.
      {adaptations.length > 0 && (
        <div className="my-4">
          {adaptations.map((adaptation) => (
            <AdaptationCard
              key={adaptation.id}
              adaptation={adaptation}
              book={book}
              onDelete={fetchAdaptations}
              onClickEdit={() => setIsEditing(true)}
              onEditSuccess={handleEditSuccess}
            />
          ))}
        </div>
      )}
      {isAdding && (
        <EditAdaptation
          book={book}
          onSuccess={handleAddSuccess}
          onCancel={() => setIsAdding(false)}
        />
      )}
      {!isAdding && !isEditing && (
        <button
          type="button"
          className="block cat-btn cat-btn-sm cat-btn-gold my-4"
          onClick={handleAdd}
        >
          + add
        </button>
      )}
    </div>
  )
}
