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
import FormToggle from "app/components/forms/FormToggle"
import EditListBooks from "app/users/[username]/lists/new/components/EditListBooks"
import ConfirmationModal from "app/components/ConfirmationModal"
import type List from "types/List"
import type Book from "types/Book"
import type { UserProfileProps } from "lib/models/UserProfile"

type Props = {
  list?: List
  firstBook?: Book
  currentUserProfile: UserProfileProps
  isEdit?: boolean
}

type ListMetadata = {
  title: string
  description: string
  ranked: boolean
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
  const [description, setDescription] = useState<string | null | undefined>(
    list?.description || undefined,
  )
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<string>()
  const [bookIdsToNotes, setBookIdsToNotes] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ListMetadata>({
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

  useEffect(() => {
    if (!list) return

    const bookIdsToBooks =
      list.books?.reduce((obj, book) => {
        obj[book.id!] = book
        return obj
      }, {}) || {}

    const _bookIdsToNotes = list.listItemAssignments.reduce((obj, lta) => {
      const book = bookIdsToBooks[lta.listedObjectId]
      obj[book.openLibraryWorkId] = lta.note
      return obj
    }, {})

    setBookIdsToNotes(_bookIdsToNotes)
  }, [list])

  function handleBookNoteChange(openLibraryWorkId, note) {
    setBookIdsToNotes({ ...bookIdsToNotes, [openLibraryWorkId]: note })
  }

  const submit = async (listData: ListMetadata) => {
    setIsSubmitting(true)
    setDescriptionErrorMessage(undefined)

    if (description && description.length > MAX_LENGTHS.description) {
      setDescriptionErrorMessage(validations.description.maxLength.message)
      setIsSubmitting(false)
      return
    }

    const toastId = toast.loading("Saving your changes...")

    const { title, ranked } = listData

    // don't use openLibraryWorkIds as keys because they don't
    // decamelize/camelize properly
    const bookNotes = Object.entries(bookIdsToNotes).map(([openLibraryWorkId, note]) => ({
      openLibraryWorkId,
      note,
    }))

    const requestData = {
      title,
      description,
      ranked,
      books,
      bookNotes,
    }

    try {
      if (isEdit) {
        const updatedList: List = await api.lists.update(list!.id, requestData)

        const successMessage = (
          <div className="flex flex-col xs:flex-row ml-2">
            Changes saved!&nbsp;
            <a href={getListLink(currentUserProfile, updatedList.slug!)} className="underline">
              View your list.
            </a>
          </div>
        )

        toast.success(successMessage, { id: toastId, duration: 8000 })
        await router.push(getEditListLink(currentUserProfile, updatedList.slug!))
        router.refresh()
      } else {
        const createdList: List = await api.lists.create(requestData)

        toast.success("Changes saved! Navigating to your list...", { id: toastId })
        await router.push(getListLink(currentUserProfile, createdList.slug!))
        router.refresh()
      }
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })
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
  const isRanked = watch("ranked")
  const readyToSubmit = titleValue?.length > 0 && books.length > 0

  return (
    <>
      <div className="my-8 mx-8 sm:mx-16 ml:max-w-3xl ml:mx-auto font-mulish">
        <div className="my-8 cat-page-title">{isEdit ? "edit" : "new"} list</div>
        <form onSubmit={handleSubmit(submit)}>
          <div className="my-8">
            <FormInput
              labelText="title"
              name="title"
              type="text"
              descriptionText={isEdit ? "Changing the title may change the list's URL." : undefined}
              formProps={register("title", validations.title)}
              remainingChars={MAX_LENGTHS.title - (titleValue?.length || 0)}
              errorMessage={errors.title?.message}
              fullWidth={false}
            />
            <FormTextarea
              labelText="description"
              name="description"
              type="text"
              rows={5}
              remainingChars={MAX_LENGTHS.description - (description?.length || 0)}
              errorMessage={descriptionErrorMessage}
              fullWidth={false}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="mt-8 max-w-sm">
              <FormToggle
                label="ranked list?"
                descriptionText="show position for each book."
                name="ranked"
                control={control}
                defaultValue={isRanked}
              />
            </div>
            <EditListBooks
              heading="books"
              books={books}
              onBookSelect={addBook}
              onBookRemove={removeBook}
              onReorder={reorderBooks}
              isRanked={isRanked}
              notesEnabled
              bookIdsToNotes={bookIdsToNotes}
              onBookNoteChange={handleBookNoteChange}
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="cat-btn cat-btn-sm cat-btn-gold my-4"
                disabled={isSubmitting || !readyToSubmit}
              >
                save
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="cat-btn cat-btn-sm cat-btn-red-outline my-4 ml-4"
                  disabled={isSubmitting || !readyToSubmit}
                >
                  delete list
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <ConfirmationModal
        title="Delete this list?"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        isOpen={showDeleteModal}
      />
    </>
  )
}
