"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import api from "lib/api"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import allValidations from "app/constants/validations"
import { dateStringToDateTime } from "lib/helpers/general"
import FormTextarea from "app/components/forms/FormTextarea"

export default function LogBookModal({ book, onClose, isOpen }) {
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  type BookNoteFormData = {
    text: string
    startDate: string
    finishDate: string
    finished: boolean
  }

  const bookNoteValidations = allValidations.bookNote

  const todayStr = dayjs().format("YYYY-MM-DD")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookNoteFormData>({
    defaultValues: {
      startDate: todayStr,
      finishDate: todayStr,
      finished: true,
    },
  })

  const startDateValue = watch("startDate")
  const textValue = watch("text")

  const validations = {
    finishDate: {
      validate: (value) =>
        new Date(startDateValue) <= new Date(value) || "Finish date must be after start date.",
    },
    text: {
      maxLength: {
        value: bookNoteValidations.text.maxLength,
        message: `The text of your note cannot be longer than ${bookNoteValidations.text.maxLength} characters.`,
      },
    },
  }

  const handleClose = async () => {
    await onClose()
  }

  const submit = async (bookNoteData: BookNoteFormData) => {
    setErrorMessage(undefined)
    setIsBusy(true)

    const toastId = toast.loading("Saving your entry...")

    const { startDate: startDateStr, finishDate: finishDateStr } = bookNoteData
    const startDate = dateStringToDateTime(startDateStr)
    const finishDate = dateStringToDateTime(finishDateStr)

    const requestData = {
      ...bookNoteData,
      startDate,
      finishDate,
      book,
    }

    try {
      await api.bookNotes.create(requestData)

      toast.success(`Entry saved!`, { id: toastId })

      await onClose()
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
                <div className="cat-eyebrow">I read...</div>
                <div className="grow mt-4 text-2xl font-semibold font-newsreader">{book.title}</div>
                <div className="text-gray-300 text-lg font-newsreader">by {book.authorName}</div>
              </div>
              <div className="">
                <form onSubmit={handleSubmit(submit)}>
                  <div className="my-8">
                    <FormTextarea
                      labelText="What'd you think?"
                      name="text"
                      type="text"
                      formProps={register("text", validations.text)}
                      rows={5}
                      remainingChars={bookNoteValidations.text.maxLength - (textValue?.length || 0)}
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
                      <div className="mt-4 sm:mt-0 sm:ml-8">
                        <label htmlFor="finishDate">
                          Finished/Stopped
                          <input
                            type="date"
                            max={todayStr}
                            {...register("finishDate", validations.finishDate)}
                            className="block mt-1 w-full px-2 py-2 bg-gray-700 rounded-sm"
                          />
                        </label>
                      </div>
                    </div>
                    {errors.finishDate && (
                      <div className="mt-2 text-red-500">{errors.finishDate.message}</div>
                    )}
                    <div className="mt-8 mb-2">
                      <label htmlFor="finished">
                        <input type="checkbox" {...register("finished")} />
                        <span className="ml-2">I finished the book.</span>
                      </label>
                    </div>
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
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
