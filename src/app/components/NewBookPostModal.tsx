"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import api from "lib/api"
import allValidations from "lib/constants/validations"
import { isValidHttpUrl } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import FormInput from "app/components/forms/FormInput"
// import FormTextarea from "app/components/forms/FormTextarea"
import BookNoteType from "enums/BookNoteType"

const bookPostValidations = allValidations.bookPost

export default function NewBookPostModal({ book, onClose, onSuccess, isOpen }) {
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  type BookPostFormData = {
    title: string
    linkUrl: string
    // text: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<BookPostFormData>()

  const titleValue = watch("title")
  // const textValue = watch("text")

  const validations = {
    title: {
      required: "Title is required.",
      maxLength: {
        value: bookPostValidations.title.maxLength,
        message: `The title of your note cannot be longer than ${bookPostValidations.title.maxLength} characters.`,
      },
    },
    linkUrl: {
      required: "Link URL is required.",
      validate: (value) => {
        if (!value) return true
        return isValidHttpUrl(value) || "Link needs to be a valid URL."
      },
    },
    // text: {
    //   maxLength: {
    //     value: MAX_LENGTHS.text,
    //     message: `The text of your note cannot be longer than ${MAX_LENGTHS.text} characters.`,
    //   },
    // },
  }

  const handleClose = async () => {
    await onClose()
  }

  const submit = async (formData: BookPostFormData) => {
    setErrorMessage(undefined)
    setIsBusy(true)

    const toastId = toast.loading("Saving your post...")

    const requestData = {
      title: formData.title,
      linkUrl: formData.linkUrl,
      noteType: BookNoteType.LinkPost,
      // text: formData.text,
      book,
    }

    try {
      await api.bookPosts.create(requestData)

      toast.success(`Post saved!`, { id: toastId })

      await onSuccess()
      await handleClose()
      reset()
    } catch (error: any) {
      console.log(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
      setErrorMessage(error.message)
    }

    setIsBusy(false)
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90vh] overflow-y-auto max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-900 px-16 py-8">
          <button onClick={handleClose} className="absolute top-[24px] right-[16px]">
            <BsXLg className="text-xl" />
          </button>

          <div className="mt-4 flex flex-col md:flex-row">
            <div className="shrink-0 w-36">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt="cover"
                  className="w-full mx-auto shadow-md rounded-md"
                />
              ) : (
                <CoverPlaceholder size="md" />
              )}
            </div>
            <div className="mt-8 md:mt-0 md:ml-8">
              <div className="cat-eyebrow-uppercase">New link post</div>
              <div className="grow mt-4 text-2xl font-semibold font-newsreader">{book.title}</div>
              <div className="text-gray-300 text-lg font-newsreader">by {book.authorName}</div>
              <div className="">
                <form onSubmit={handleSubmit(submit)}>
                  <div className="my-4">
                    <FormInput
                      labelText="title"
                      name="title"
                      type="text"
                      formProps={register("title", validations.title)}
                      remainingChars={
                        bookPostValidations.title.maxLength - (titleValue?.length || 0)
                      }
                      bgColor="bg-gray-800"
                      errorMessage={errors.title?.message}
                    />
                    <FormInput
                      labelText="link URL"
                      name="linkUrl"
                      type="text"
                      formProps={register("linkUrl", validations.linkUrl)}
                      bgColor="bg-gray-800"
                      errorMessage={errors.linkUrl?.message}
                    />
                    {/* <FormTextarea
                      labelText="Comment"
                      name="text"
                      type="text"
                      formProps={register("text", validations.text)}
                      rows={5}
                      remainingChars={MAX_LENGTHS.text - (textValue?.length || 0)}
                      errorMessage={errors.text?.message}
                      fullWidth
                      bgColor="bg-gray-800"
                      moreClasses="mt-1"
                    /> */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="mt-4 cat-btn cat-btn-md cat-btn-gold"
                        disabled={isBusy}
                      >
                        save
                      </button>
                    </div>
                    <div className="w-96">
                      {errorMessage && <div className="mt-3 text-red-500">{errorMessage}</div>}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
