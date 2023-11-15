"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import api from "lib/api"
import useEditBookList from "lib/hooks/useEditBookList"
import { getListLink, getEditListLink, getUserListsLink } from "lib/helpers/general"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import EditListBooks from "app/users/[username]/lists/new/components/EditListBooks"
import ConfirmationModal from "app/components/ConfirmationModal"
import type List from "types/List"
import type Book from "types/Book"
import type UserProfile from "types/UserProfile"

type Props = {
  list?: List
  firstBook?: Book
  currentUserProfile: UserProfile
  isEdit?: boolean
}

const MAX_LENGTHS = {
  title: 100,
  description: 2000,
}

const validations = {
  title: {
    required: true,
    maxLength: {
      value: MAX_LENGTHS.title,
      message: `Title cannot be longer than ${MAX_LENGTHS.title} characters.`,
    },
  },
  description: {
    maxLength: {
      value: MAX_LENGTHS.description,
      message: `Description cannot be longer than ${MAX_LENGTHS.description} characters.`,
    },
  },
}

export default function EditList({ list, firstBook, currentUserProfile, isEdit = false }: Props) {
  const router = useRouter()
  const { books, addBook, removeBook, reorderBooks } = useEditBookList(list)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ [k: string]: string }>({
    defaultValues: list as any,
  })

  useEffect(() => {
    if (!firstBook) return

    const isBookAlreadyInList = books.find(
      (book) => book.openLibraryWorkId === firstBook.openLibraryWorkId,
    )
    if (!isBookAlreadyInList) {
      addBook(firstBook)
    }
  }, [firstBook, addBook, books])

  const submit = async (listData) => {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    const toastId = toast.loading("Saving your changes...")

    const { title, description } = listData

    const requestData = {
      title,
      description,
      books,
    }

    try {
      if (isEdit) {
        const updatedList: List = await api.lists.update(list!.id, requestData)

        const successMessage = (
          <>
            Changes saved!&nbsp;
            <a href={getListLink(currentUserProfile, updatedList.slug!)}>
              <button type="button" className="cat-btn-link">
                View your list.
              </button>
            </a>
          </>
        )

        toast.success(successMessage, { id: toastId, duration: 8000 })
        router.push(getEditListLink(currentUserProfile, updatedList.slug!))
      } else {
        const createdList: List = await api.lists.create(requestData)

        toast.success("Changes saved!", { id: toastId })
        router.push(getListLink(currentUserProfile, createdList.slug!))
      }
    } catch (error: any) {
      setErrorMessage(error.message)
      toast.error("Oh no! There was an error.", { id: toastId })
    }

    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!list?.id || !isEdit) {
      toast.error("Hmm, something went wrong.")
      return
    }

    const toastId = toast.loading("Deleting your list...")

    try {
      await api.lists.delete(list.id)

      toast.success("List deleted!", { id: toastId })
      router.push(getUserListsLink(currentUserProfile!.username))
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })
    }
  }

  const titleValue = watch("title")
  const descriptionValue = watch("description")
  const readyToSubmit = titleValue?.length > 0 && books.length > 0

  return (
    <>
      <div className="my-8 max-w-3xl mx-auto font-mulish">
        <div className="my-8 cat-page-title">{isEdit ? "Edit" : "New"} List</div>
        <form onSubmit={handleSubmit(submit)}>
          <div className="my-8">
            <FormInput
              labelText="Title"
              name="title"
              type="text"
              descriptionText="Changing the title may change the list's URL."
              formProps={register("title", validations.title)}
              remainingChars={MAX_LENGTHS.title - (titleValue?.length || 0)}
              errorMessage={errors.title?.message}
              fullWidth={false}
            />
            <FormTextarea
              labelText="Description"
              name="description"
              type="text"
              formProps={register("description", validations.description)}
              remainingChars={MAX_LENGTHS.description - (descriptionValue?.length || 0)}
              errorMessage={errors.description?.message}
              fullWidth={false}
            />
            <EditListBooks
              heading="Books"
              books={books}
              onBookSelect={addBook}
              onBookRemove={removeBook}
              onReorder={reorderBooks}
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="cat-btn cat-btn-gold my-4"
                disabled={isSubmitting || !readyToSubmit}
              >
                Save changes
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="cat-btn cat-btn-red-outline my-4 ml-4"
                  disabled={isSubmitting || !readyToSubmit}
                >
                  Delete list
                </button>
              )}
            </div>
            <div className="w-96">
              {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
            </div>
          </div>
        </form>
      </div>
      <ConfirmationModal
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        isOpen={showDeleteModal}
      />
    </>
  )
}
