"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import { toast } from "react-hot-toast"
import { Tooltip } from "react-tooltip"
import { BsXLg } from "react-icons/bs"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import { SlInfo } from "react-icons/sl"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import FormTextarea from "app/components/forms/FormTextarea"
import FormToggle from "app/components/forms/FormToggle"
import allValidations from "lib/constants/validations"
import { dateTimeFormats } from "lib/constants/dateTime"
import { dateStringToDateTime } from "lib/helpers/general"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"
import BookNoteType from "enums/BookNoteType"
import type Book from "types/Book"
import type BookRead from "types/BookRead"

const { inputFieldDate } = dateTimeFormats

const readingStatusToCopy = {
  [BookNoteReadingStatus.Started]: {
    buttonClass: "cat-btn-green",
    buttonCopy: "started",
    eyebrowCopy: "I started...",
    textPrompt: "Any thoughts going in?",
    editDatesCopy: "edit start date",
    clearDatesCopy: "clear",
    likeButtonCopy: "I love this book already.",
  },
  [BookNoteReadingStatus.Reading]: {
    buttonClass: "cat-btn-teal",
    buttonCopy: "still reading",
    eyebrowCopy: "I'm still reading...",
    textPrompt: "What's on your mind?",
    editDatesCopy: "edit start date",
    clearDatesCopy: "clear",
    likeButtonCopy: "I love this book.",
  },
  [BookNoteReadingStatus.Finished]: {
    buttonClass: "cat-btn-gold",
    buttonCopy: "finished",
    eyebrowCopy: "I finished...",
    textPrompt: "What'd you think?",
    editDatesCopy: "edit start/finish dates",
    clearDatesCopy: "clear dates",
    likeButtonCopy: "I loved this book.",
  },
  [BookNoteReadingStatus.Abandoned]: {
    buttonClass: "cat-btn-light-gray",
    buttonCopy: "abandoned",
    eyebrowCopy: "I abandoned...",
    textPrompt: "What'd you think?",
    editDatesCopy: "edit start/stop dates",
    clearDatesCopy: "clear dates",
    likeButtonCopy: "I loved this book.",
  },
  [BookNoteReadingStatus.None]: {
    buttonClass: "cat-btn-white-outline",
    buttonCopy: "none of these",
    eyebrowCopy: "a note on...",
    textPrompt: "What's on your mind?",
    editDatesCopy: "",
    clearDatesCopy: "",
    likeButtonCopy: "I love this book.",
  },
}

export default function BookNoteModal({
  book,
  onClose,
  onSuccess,
  isOpen,
  like: _like,
  existingBookRead: _existingBookRead,
}: {
  book: Book
  onClose: () => void
  onSuccess: () => void
  isOpen: boolean
  like: boolean
  existingBookRead?: BookRead
}) {
  const [readingStatus, setReadingStatus] = useState<BookNoteReadingStatus>()
  const [text, setText] = useState<string>("")
  const [textErrorMessage, setTextErrorMessage] = useState<string>()
  const [like, setLike] = useState<boolean>(_like)
  const [existingBookRead, setExistingBookRead] = useState<BookRead | undefined>(_existingBookRead)
  const [isEditingDates, setIsEditingDates] = useState<boolean>(false)
  const [isBusy, setIsBusy] = useState<boolean>(false)

  type BookNoteFormData = {
    text: string
    startDate: string
    endDate: string
    hasSpoilers: boolean
  }

  const bookNoteValidations = allValidations.bookNote

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<BookNoteFormData>()

  const startDateValue = watch("startDate")
  const hasSpoilers = watch("hasSpoilers")

  const validations = {
    endDate: {
      validate: (value) => {
        if (!startDateValue || !value) return true
        if (new Date(startDateValue) <= new Date(value)) return true
        return "Finish/stopped date must be after start date."
      },
    },
    text: {
      maxLength: {
        value: bookNoteValidations.text.maxLength,
        message: `The text of your note cannot be longer than ${bookNoteValidations.text.maxLength} characters.`,
      },
    },
  }

  useEffect(() => {
    setLike(_like)
  }, [_like])

  useEffect(() => {
    setExistingBookRead(_existingBookRead)
  }, [_existingBookRead])

  useEffect(() => {
    setIsEditingDates(false)
  }, [readingStatus])

  const todayStr = dayjs().format(inputFieldDate)

  // set existing or default start and end dates
  useEffect(() => {
    let startDateStr = todayStr

    // existingBookRead's startDate overrides todayStr,
    // whether it's present or null
    if (existingBookRead) {
      const { startDate } = existingBookRead
      startDateStr = startDate ? dayjs(startDate).format(inputFieldDate) : ""
    }

    if (readingStatus === BookNoteReadingStatus.Started) {
      setValue("startDate", todayStr)
      setValue("endDate", "")
    } else if (readingStatus === BookNoteReadingStatus.Reading) {
      setValue("startDate", startDateStr)
      setValue("endDate", "")
    } else if (
      readingStatus === BookNoteReadingStatus.Finished ||
      readingStatus === BookNoteReadingStatus.Abandoned
    ) {
      setValue("startDate", startDateStr)
      setValue("endDate", todayStr)
    }
  }, [readingStatus, setValue, existingBookRead, todayStr])

  const clearDates = () => {
    setValue("startDate", "")
    setValue("endDate", "")
  }

  const handleClose = async () => {
    await onClose()
    setReadingStatus(undefined)
  }

  const submit = async (formData: BookNoteFormData) => {
    setTextErrorMessage(undefined)
    setIsBusy(true)

    if (text && text.length > bookNoteValidations.text.maxLength) {
      setTextErrorMessage(validations.text.maxLength.message)
      setIsBusy(false)
      return
    }

    const toastId = toast.loading("Saving your note...")

    const { startDate: startDateStr, endDate: endDateStr, hasSpoilers: _hasSpoilers } = formData
    const startDate = startDateStr ? dateStringToDateTime(startDateStr) : undefined
    const endDate = endDateStr ? dateStringToDateTime(endDateStr) : undefined

    const requestData = {
      bookNote: {
        text,
        readingStatus,
        hasSpoilers: _hasSpoilers,
        noteType: BookNoteType.JournalEntry,
      },
      bookRead: {
        id: existingBookRead?.id,
        startDate,
        endDate,
      },
      like,
      book,
    }

    try {
      await api.bookNotes.create(requestData)

      toast.success(`Note saved!`, { id: toastId })

      await handleClose()
      await onSuccess()
      reset()
    } catch (error: any) {
      reportToSentry(error, requestData)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90vh] overflow-y-auto max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-900 px-16 py-8">
          <button onClick={handleClose} className="absolute top-[24px] right-[24px]">
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
              <div className="">
                {readingStatus ? (
                  <div className="flex justify-between">
                    <div className="cat-eyebrow-uppercase">
                      {readingStatusToCopy[readingStatus].eyebrowCopy}
                    </div>
                    <button
                      onClick={() => setReadingStatus(undefined)}
                      className="cat-btn-link ml-4 text-sm text-gray-300"
                    >
                      change
                    </button>
                  </div>
                ) : (
                  <div className="cat-eyebrow-uppercase">a note on...</div>
                )}
                <div className="grow mt-4 text-2xl font-semibold font-newsreader">{book.title}</div>
                <div className="text-gray-300 text-lg font-newsreader">by {book.authorName}</div>
                {!readingStatus && (
                  <div className="my-4 flex flex-col sm:flex-row">
                    {Object.values(BookNoteReadingStatus).map((rs) => (
                      <button
                        key={rs}
                        onClick={() => setReadingStatus(rs)}
                        className={`my-1 sm:my-0 sm:mx-1 cat-btn cat-btn-sm ${readingStatusToCopy[rs].buttonClass}`}
                      >
                        {readingStatusToCopy[rs].buttonCopy}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {readingStatus && (
                <div className="">
                  <form onSubmit={handleSubmit(submit)}>
                    <div className="my-4 w-full sm:w-96 max-w-[384px]">
                      <FormTextarea
                        labelText={readingStatusToCopy[readingStatus].textPrompt}
                        name="text"
                        type="text"
                        rows={5}
                        remainingChars={bookNoteValidations.text.maxLength - (text?.length || 0)}
                        errorMessage={textErrorMessage}
                        fullWidth
                        bgColor="bg-gray-800"
                        moreClasses="mt-1"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                      <FormToggle
                        label="Spoilers"
                        name="hasSpoilers"
                        control={control}
                        defaultValue={hasSpoilers}
                      />
                      <div
                        className={
                          isEditingDates || readingStatus === BookNoteReadingStatus.None
                            ? "hidden"
                            : ""
                        }
                      >
                        <button
                          type="button"
                          onClick={() => setIsEditingDates(true)}
                          className="mt-2 cat-btn-link text-sm"
                        >
                          {readingStatusToCopy[readingStatus].editDatesCopy}
                        </button>
                        <SlInfo id="edit-dates-info" className="inline-block ml-2 text-xs" />
                        <Tooltip anchorSelect="#edit-dates-info" className="text-sm max-w-fit z-10">
                          Your read dates won't show up anywhere yet, but will go into a timeline of
                          your reading history that you'll be able to see in the future.
                        </Tooltip>
                      </div>
                      <div className={isEditingDates ? "" : "hidden"}>
                        <div className="flex flex-col sm:flex-row">
                          <div>
                            <label htmlFor="startDate">
                              started
                              <input
                                type="date"
                                max={todayStr}
                                {...register("startDate")}
                                className="block mt-1 w-full px-3 py-1 bg-gray-700 rounded-sm"
                              />
                            </label>
                          </div>
                          {(readingStatus === BookNoteReadingStatus.Finished ||
                            readingStatus === BookNoteReadingStatus.Abandoned) && (
                            <div className="mt-4 sm:mt-0 sm:ml-8">
                              <label htmlFor="endDate">
                                {readingStatus === BookNoteReadingStatus.Finished
                                  ? "finished"
                                  : "stopped"}
                                <input
                                  type="date"
                                  max={todayStr}
                                  {...register("endDate", validations.endDate)}
                                  className="block mt-1 w-full px-3 py-1 bg-gray-700 rounded-sm"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                        <div className="">
                          <button
                            type="button"
                            onClick={clearDates}
                            className="mt-1 cat-btn-link text-sm text-gray-300"
                          >
                            {readingStatusToCopy[readingStatus].clearDatesCopy}
                          </button>
                        </div>
                        {errors.endDate && (
                          <div className="mt-2 text-red-500">{errors.endDate.message}</div>
                        )}
                      </div>

                      <div className="mt-8 my-4 flex">
                        {like ? (
                          <FaHeart
                            className="text-red-300 cursor-pointer"
                            onClick={() => setLike(false)}
                          />
                        ) : (
                          <FaRegHeart
                            className="text-gray-500 cursor-pointer"
                            onClick={() => setLike(true)}
                          />
                        )}
                        <span className="ml-2 inline-block -mt-1">
                          {readingStatusToCopy[readingStatus].likeButtonCopy}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="mt-4 cat-btn cat-btn-sm cat-btn-gold"
                          disabled={
                            isBusy || (!!text && text.length > bookNoteValidations.text.maxLength)
                          }
                        >
                          save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
