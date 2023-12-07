"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import api from "lib/api"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import allValidations from "app/constants/validations"
import { dateStringToDateTime } from "lib/helpers/general"
import ReadingStatus from "enums/BookNoteReadingStatus"
import FormTextarea from "app/components/forms/FormTextarea"

const readingStatusToCopy = {
  [ReadingStatus.Started]: {
    buttonCopy: "Started",
    eyebrowCopy: "I started...",
    textPrompt: "Any thoughts going in?",
  },
  [ReadingStatus.Reading]: {
    buttonCopy: "Still reading",
    eyebrowCopy: "I'm still reading...",
    textPrompt: "What's on your mind?",
  },
  [ReadingStatus.Finished]: {
    buttonCopy: "Finished",
    eyebrowCopy: "I finished...",
    textPrompt: "What'd you think?",
  },
  [ReadingStatus.Abandoned]: {
    buttonCopy: "Abandoned",
    eyebrowCopy: "I abandoned...",
    textPrompt: "What'd you think?",
  },
}

export default function LogBookModal({ book, onClose, onSuccess, isOpen }) {
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  type BookNoteFormData = {
    text: string
    startDate: string
    endDate: string
    readingStatus: ReadingStatus
  }

  const bookNoteValidations = allValidations.bookNote

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<BookNoteFormData>()

  const startDateValue = watch("startDate")
  const textValue = watch("text")

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

  const todayStr = dayjs().format("YYYY-MM-DD")

  // set existing or default start and end dates
  useEffect(() => {
    const lastUnfinishedBookRead = book.bookReads
      .filter((br) => !!br.startDate && !br.endDate)
      .sort((a, b) => b.startDate - a.startDate)[0]

    let startDateStr = todayStr
    if (lastUnfinishedBookRead) {
      startDateStr = dayjs(lastUnfinishedBookRead.startDate).format("YYYY-MM-DD")
    }
    if (readingStatus === ReadingStatus.Started) {
      setValue("startDate", todayStr)
      setValue("endDate", "")
    } else if (readingStatus === ReadingStatus.Reading) {
      setValue("startDate", startDateStr)
      setValue("endDate", "")
    } else if (
      readingStatus === ReadingStatus.Finished ||
      readingStatus === ReadingStatus.Abandoned
    ) {
      setValue("startDate", startDateStr)
      setValue("endDate", todayStr)
    }
  }, [readingStatus, setValue, book.bookReads, todayStr])

  const handleClose = async () => {
    await onClose()
    setReadingStatus(undefined)
  }

  const submit = async (formData: BookNoteFormData) => {
    setErrorMessage(undefined)
    setIsBusy(true)

    const toastId = toast.loading("Saving your entry...")

    const { startDate: startDateStr, endDate: endDateStr } = formData
    const startDate = startDateStr ? dateStringToDateTime(startDateStr) : undefined
    const endDate = endDateStr ? dateStringToDateTime(endDateStr) : undefined

    const requestData = {
      bookNote: {
        text: formData.text,
        readingStatus: formData.readingStatus,
      },
      bookRead: {
        startDate,
        endDate,
      },
      book,
    }

    try {
      await api.bookNotes.create(requestData)

      toast.success(`Entry saved!`, { id: toastId })

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
        <Dialog.Panel className="relative rounded max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-900 px-16 py-8">
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
                <CoverPlaceholder />
              )}
            </div>
            <div className="mt-8 md:mt-0 md:ml-8">
              <div className="">
                {readingStatus && (
                  <div className="flex justify-between">
                    <div className="cat-eyebrow">
                      {readingStatusToCopy[readingStatus].eyebrowCopy}
                    </div>
                    <button
                      onClick={() => setReadingStatus(undefined)}
                      className="cat-btn-link ml-4 text-sm text-gray-300"
                    >
                      Change
                    </button>
                  </div>
                )}
                <div className="grow mt-4 text-2xl font-semibold font-newsreader">{book.title}</div>
                <div className="text-gray-300 text-lg font-newsreader">by {book.authorName}</div>
                {!readingStatus && (
                  <div className="my-4 flex flex-col sm:flex-row">
                    {Object.values(ReadingStatus).map((rs) => (
                      <button
                        key={rs}
                        onClick={() => {
                          setReadingStatus(rs)
                          setValue("readingStatus", rs)
                        }}
                        className="my-1 sm:my-0 sm:mx-1 block cat-btn cat-btn-gray cat-btn-md"
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
                    <div className="my-8">
                      <FormTextarea
                        labelText={readingStatusToCopy[readingStatus].textPrompt}
                        name="text"
                        type="text"
                        formProps={register("text", validations.text)}
                        rows={5}
                        remainingChars={
                          bookNoteValidations.text.maxLength - (textValue?.length || 0)
                        }
                        errorMessage={errors.text?.message}
                        fullWidth
                        bgColor="bg-gray-800"
                        moreClasses="mt-1"
                      />
                      <div className="flex flex-col sm:flex-row">
                        <div>
                          <label htmlFor="startDate">
                            Started
                            <input
                              type="date"
                              max={todayStr}
                              {...register("startDate")}
                              className="block mt-1 w-full px-3 py-2 bg-gray-700 rounded-sm"
                            />
                          </label>
                        </div>
                        {(readingStatus === ReadingStatus.Finished ||
                          readingStatus === ReadingStatus.Abandoned) && (
                          <div className="mt-4 sm:mt-0 sm:ml-8">
                            <label htmlFor="endDate">
                              {readingStatus === ReadingStatus.Finished ? "Finished" : "Stopped"}
                              <input
                                type="date"
                                max={todayStr}
                                {...register("endDate", validations.endDate)}
                                className="block mt-1 w-full px-2 py-2 bg-gray-700 rounded-sm"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                      {errors.endDate && (
                        <div className="mt-2 text-red-500">{errors.endDate.message}</div>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="mt-4 cat-btn cat-btn-md cat-btn-gold"
                          disabled={isBusy}
                        >
                          Save
                        </button>
                      </div>
                      <div className="w-96">
                        {errorMessage && <div className="mt-3 text-red-500">{errorMessage}</div>}
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
