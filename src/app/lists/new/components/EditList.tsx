"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import humps from "humps"
import { fetchJson } from "lib/helpers/general"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import EditListBooks from "app/lists/new/components/EditListBooks"
import type Book from "types/Book"

const validations = {
  title: {
    maxLength: {
      value: 100,
      message: "Title cannot be longer than 100 characters.",
    },
  },
  description: {
    maxLength: {
      value: 2000,
      message: "Description cannot be longer than 2000 characters.",
    },
  },
}

export default function CreateList() {
  const [books, setBooks] = useState<Book[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<{ [k: string]: string }>()

  const addBook = (selectedBook: Book) => {
    const bookAlreadyInList = books.some(
      (b) => b.openlibraryBookId === selectedBook.openlibraryBookId,
    )
    if (bookAlreadyInList) {
      toast.error("This book is already in your list!")
      return
    }

    const updatedBooks = [...books, selectedBook]
    setBooks(updatedBooks)
  }

  const removeBook = (book: Book) => {
    const updatedBooks = books.filter((b) => b.openlibraryBookId !== book.openlibraryBookId)
    setBooks(updatedBooks)
  }

  const submit = async (listData) => {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    console.log(listData)

    const toastId = toast.loading("Saving your changes...")

    const { title, description } = listData

    const requestData = {
      title,
      description,
      books,
    }

    console.log(requestData)
    console.log(errors)

    try {
      const createdList = await fetchJson(`/api/lists`, {
        method: "POST",
        body: JSON.stringify(humps.decamelizeKeys(requestData)),
      })

      toast.success("Changes saved!", { id: toastId })
      console.log(createdList)
    } catch (error: any) {
      setErrorMessage(error.message)
      toast.error("Oh no! There was an error.", { id: toastId })
    }

    setIsSubmitting(false)
  }

  const readyToSubmit = getValues("title")?.length > 0 && books.length > 0

  return (
    <div className="my-8 max-w-3xl mx-auto font-nunito-sans">
      <div className="my-8 text-3xl">New List</div>
      <form onSubmit={handleSubmit(submit)}>
        <div className="my-8">
          <FormInput
            labelText="Title"
            name="title"
            type="text"
            formProps={register("title", validations.title)}
            errorMessage={errors.title?.message}
            fullWidth={false}
          />
          <FormTextarea
            labelText="Description"
            name="description"
            type="text"
            formProps={register("description", validations.description)}
            errorMessage={errors.description?.message}
            fullWidth={false}
          />
          <EditListBooks books={books} onBookSelect={addBook} onBookRemove={removeBook} />
          <div className="inline-block">
            <button
              type="submit"
              className="cat-btn cat-btn-teal my-4"
              disabled={isSubmitting || !readyToSubmit}
            >
              Save changes
            </button>
          </div>
          <div className="w-96">
            {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
          </div>
        </div>
      </form>
    </div>
  )
}
