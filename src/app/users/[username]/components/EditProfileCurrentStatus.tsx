import { useState } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import Search from "app/components/nav/Search"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import FormTextarea from "app/components/forms/FormTextarea"
import validations from "lib/constants/validations"
import type Book from "types/Book"

export default function EditProfileCurrentStatus({
  userCurrentStatus,
  onEditSuccess,
  onDeleteSuccess,
  onCancel,
}) {
  const [selectedBook, setSelectedBook] = useState<Book | null | undefined>(userCurrentStatus?.book)
  const [text, setText] = useState<string>(userCurrentStatus?.text)
  const [textErrorMsg, setTextErrorMsg] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showBookSearch, setShowBookSearch] = useState<boolean>(false)

  const {
    text: { maxLength: textMaxLength },
  } = validations.userCurrentStatus

  function onBookSelect(book) {
    setSelectedBook(book)
  }

  async function submit() {
    setTextErrorMsg(undefined)

    if (!text && !selectedBook) {
      await handleDelete()
      return
    }

    if (text && text.length > textMaxLength) {
      setTextErrorMsg(`The text of your status cannot be longer than ${textMaxLength} characters.`)
      return
    }

    setIsBusy(true)

    const toastId = toast.loading("Saving...")

    const requestData = {
      book: selectedBook,
      text,
    }

    try {
      const createdUserCurrentStatus = await api.userCurrentStatuses.create(requestData)

      toast.success(`Current status saved!`, { id: toastId })
      onEditSuccess(createdUserCurrentStatus)
    } catch (error: any) {
      reportToSentry(error, requestData)
      toast.error("Hmm, something went wrong.", { id: toastId })
      setTextErrorMsg(error.message)
    }

    setIsBusy(false)
  }

  const handleDelete = async () => {
    setIsBusy(true)

    const toastId = toast.loading("Clearing current status...")

    try {
      await api.userCurrentStatuses.delete()

      toast.success(`Current status cleared!`, { id: toastId })
      onDeleteSuccess()
    } catch (error: any) {
      reportToSentry(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col sm:items-end lg:items-start">
      <div className="sm:mr-8 lg:mr-0">
        <div className="w-[144px] mx-auto my-4">
          {selectedBook ? (
            <div className="">
              {selectedBook.coverImageUrl ? (
                <img
                  src={selectedBook.coverImageUrl}
                  alt="cover"
                  className="object-top mx-auto shadow-md rounded-sm"
                />
              ) : (
                <CoverPlaceholder book={selectedBook} />
              )}
              <button
                onClick={() => setSelectedBook(undefined)}
                className="mt-2 cat-btn-link text-sm text-gray-300"
              >
                remove
              </button>
            </div>
          ) : (
            showBookSearch && <CoverPlaceholder />
          )}
        </div>
        {!selectedBook &&
          (showBookSearch ? (
            <div className="my-4">
              <Search isNav={false} onSelect={onBookSelect} fullWidth />
              <button
                className="mt-2 cat-btn-link text-sm text-gray-300"
                onClick={() => setShowBookSearch(false)}
              >
                go back to text only
              </button>
            </div>
          ) : (
            <button
              className="cat-btn-link text-sm text-gray-300"
              onClick={() => setShowBookSearch(true)}
            >
              include a book
            </button>
          ))}
      </div>
      <div className="grow">
        <FormTextarea
          name="text"
          type="text"
          rows={3}
          remainingChars={textMaxLength - (text?.length || 0)}
          errorMessage={textErrorMsg}
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          showFormattingReferenceTooltip={false}
        />
        <div className="flex justify-end">
          <button
            disabled={isBusy}
            className="mr-2 cat-btn cat-btn-sm cat-btn-white-outline"
            onClick={onCancel}
          >
            cancel
          </button>
          <button disabled={isBusy} className="cat-btn cat-btn-sm cat-btn-gold" onClick={submit}>
            save
          </button>
        </div>
      </div>
    </div>
  )
}
