"use client"

import { useState, useCallback } from "react"
import { Dialog } from "@headlessui/react"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import { useModals } from "lib/contexts/ModalsContext"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import UserSearch from "app/components/UserSearch"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import FormTextarea from "app/components/forms/FormTextarea"

const NOTE_MAX_LENGTH = 300

export default function NewBookPostModal({ book, isOpen }) {
  const { setCurrentBook, setCurrentModal } = useModals()

  const [recipient, setRecipient] = useState<any>()
  const [note, setNote] = useState<string>("")
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const handleClose = useCallback(async () => {
    setCurrentBook(undefined)
    setCurrentModal(undefined)
  }, [setCurrentBook, setCurrentModal])

  const submit = useCallback(async () => {
    if (note && note.length > NOTE_MAX_LENGTH) {
      return
    }

    setErrorMessage(undefined)
    setIsBusy(true)

    const toastId = toast.loading("Sending your rec...")

    const requestData = {
      book,
      recipientId: recipient.id,
      note,
    }

    try {
      await api.recommendations.create(requestData)

      toast.success("Your rec has been sent!", { id: toastId })

      handleClose()
    } catch (error: any) {
      reportToSentry(error, {
        ...requestData,
        method: "RecommendBookModal.submit",
      })
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }, [note, handleClose, setErrorMessage, setIsBusy, book, recipient])

  const readyToSubmit = recipient && (!note || note.length <= NOTE_MAX_LENGTH)

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90vh] overflow-y-auto max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-950 px-16 py-8">
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
              <div className="cat-eyebrow-uppercase">Recommend...</div>
              <div className="grow mt-4 text-2xl font-semibold font-newsreader">{book.title}</div>
              <div className="text-gray-300 text-lg font-newsreader">by {book.authorName}</div>

              <div className="my-4">
                <div className="cat-eyebrow-uppercase">to...</div>
                <div className="my-2">
                  {recipient ? (
                    <div className="flex items-center justify-between">
                      <NameWithAvatar userProfile={recipient} bothNames />
                      <button
                        onClick={() => setRecipient(null)}
                        className="text-gray-300 text-sm cat-link"
                      >
                        change
                      </button>
                    </div>
                  ) : (
                    <UserSearch
                      followersOnly
                      onSelect={(selectedUser) => setRecipient(selectedUser)}
                    />
                  )}
                </div>
              </div>

              <div className="">
                <form>
                  <div className="my-4 w-full sm:w-96 max-w-[384px]">
                    <FormTextarea
                      labelText="note"
                      name="note"
                      type="text"
                      rows={3}
                      remainingChars={NOTE_MAX_LENGTH - (note?.length || 0)}
                      fullWidth
                      bgColor="bg-gray-900"
                      moreClasses="mt-1"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      showFormattingReferenceTooltip={false}
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={submit}
                        className="mt-4 cat-btn cat-btn-sm cat-btn-gold"
                        disabled={isBusy || !readyToSubmit}
                      >
                        recommend
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
