"use client"

import { useState, useCallback } from "react"
import { Dialog } from "@headlessui/react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import { FaRegQuestionCircle } from "react-icons/fa"
import { Tooltip } from "react-tooltip"
import { useModals } from "lib/contexts/ModalsContext"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import allValidations from "lib/constants/validations"
import { isValidHttpUrl, getPostLink } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import FormToggle from "app/components/forms/FormToggle"
import BookNoteType from "enums/BookNoteType"
import CurrentModal from "enums/CurrentModal"

const bookPostValidations = allValidations.bookPost

export default function NewBookPostModal({ book, onClose, onSuccess, isOpen }) {
  const { setCurrentBook, setCurrentModal } = useModals()

  const [text, setText] = useState<string>("")
  const [textErrorMessage, setTextErrorMessage] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  type BookPostFormData = {
    title: string
    linkUrl: string
    hasSpoilers: boolean
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
  } = useForm<BookPostFormData>()

  const titleValue = watch("title")
  const linkUrlValue = watch("linkUrl")
  const hasSpoilers = watch("hasSpoilers")

  const validations = {
    title: {
      required: "Title is required.",
      maxLength: {
        value: bookPostValidations.title.maxLength,
        message: `The title of your note cannot be longer than ${bookPostValidations.title.maxLength} characters.`,
      },
    },
    linkUrl: {
      validate: (value) => {
        if (!value) return true
        return isValidHttpUrl(value) || "Link needs to be a valid URL."
      },
    },
    text: {
      maxLength: {
        value: bookPostValidations.text.maxLength,
        message: `The text of your note cannot be longer than ${bookPostValidations.text.maxLength} characters.`,
      },
    },
  }

  const handleClose = useCallback(async () => {
    await onClose()
    setCurrentBook(undefined)
  }, [onClose, setCurrentBook])

  const submit = useCallback(
    async (formData: BookPostFormData) => {
      if (text && text.length > bookPostValidations.text.maxLength) {
        setTextErrorMessage(validations.text.maxLength.message)
        return
      }

      if (!text && !formData.linkUrl) {
        setErrorMessage("Link OR text is required.")
        return
      }

      setErrorMessage(undefined)
      setIsBusy(true)

      const toastId = toast.loading("Saving your post...")

      const requestData = {
        title: formData.title,
        linkUrl: formData.linkUrl,
        noteType: BookNoteType.Post,
        text,
        hasSpoilers: formData.hasSpoilers,
        book,
      }

      try {
        const createdPost = await api.bookPosts.create(requestData)

        const successMessage = (
          <div className="flex flex-col xs:block ml-2">
            Post saved!&nbsp;&nbsp;
            <a href={getPostLink(createdPost.id)} className="underline">
              View your post.
            </a>
          </div>
        )

        toast.success(successMessage, { id: toastId })

        console.log("NewBookPostModal onSuccess", onSuccess)

        if (onSuccess) await onSuccess()
        await handleClose()
        reset()
      } catch (error: any) {
        reportToSentry(error, requestData)
        toast.error("Hmm, something went wrong.", { id: toastId })
      }

      setIsBusy(false)
    },
    [onSuccess, text, book, reset, handleClose, validations.text.maxLength],
  )

  const readyToSubmit =
    titleValue &&
    (linkUrlValue || text) &&
    !(text && text.length > bookPostValidations.text.maxLength)

  const linkUrlLabel = (
    <div className="flex">
      <span>link url</span>
      <FaRegQuestionCircle id="links-info" className="mt-[5px] ml-1.5 text-sm" />
      <Tooltip anchorSelect="#links-info" className="text-sm max-w-fit" place="bottom">
        optional: a review, interview, essay, podcast, TikTok, event, meme (etc!) related to this
        book
      </Tooltip>
    </div>
  )

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90vh] overflow-y-auto max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-900 px-16 py-8">
          <button onClick={handleClose} className="absolute top-[24px] right-[24px]">
            <BsXLg className="text-xl" />
          </button>

          <button
            onClick={() => setCurrentModal(CurrentModal.GlobalCreate)}
            className="md:hidden mb-2 cat-link text-sm text-gray-300"
          >
            back to menu
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

              <button
                onClick={() => setCurrentModal(CurrentModal.GlobalCreate)}
                className="hidden md:block my-2 cat-link text-sm text-gray-300"
              >
                back to menu
              </button>
            </div>
            <div className="mt-8 md:mt-0 md:ml-8">
              <div className="cat-eyebrow-uppercase">New post / thread</div>
              <div className="grow mt-4 text-2xl font-semibold font-newsreader">{book.title}</div>
              <div className="text-gray-300 text-lg font-newsreader">by {book.authorName}</div>
              <div className="">
                <form onSubmit={handleSubmit(submit)}>
                  <div className="my-4 w-full sm:w-96 max-w-[384px]">
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
                      labelText={linkUrlLabel}
                      name="linkUrl"
                      type="text"
                      formProps={register("linkUrl", validations.linkUrl)}
                      bgColor="bg-gray-800"
                      errorMessage={errors.linkUrl?.message}
                    />
                    <FormTextarea
                      labelText="text"
                      name="text"
                      type="text"
                      rows={5}
                      remainingChars={bookPostValidations.text.maxLength - (text?.length || 0)}
                      errorMessage={textErrorMessage}
                      fullWidth
                      bgColor="bg-gray-800"
                      moreClasses="mt-1"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />

                    <FormToggle
                      label="spoilers"
                      name="hasSpoilers"
                      control={control}
                      defaultValue={hasSpoilers}
                      compact
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="mt-4 cat-btn cat-btn-sm cat-btn-gold"
                        disabled={isBusy || !readyToSubmit}
                      >
                        save
                      </button>
                    </div>
                    {errorMessage && (
                      <div className="mt-4 text-sm text-red-500">{errorMessage}</div>
                    )}
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
