import { useState } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import Search from "app/components/nav/Search"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import FormTextarea from "app/components/forms/FormTextarea"
import validations from "lib/constants/validations"
import ConfirmationModal from "app/components/ConfirmationModal"
import type Book from "types/Book"

export default function EditProfileCurrentStatus({
  userCurrentStatus,
  onEditSuccess,
  onDeleteSuccess,
  onCancel,
}) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(userCurrentStatus?.book)
  const [text, setText] = useState<string>(userCurrentStatus?.text)
  const [textErrorMsg, setTextErrorMsg] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)

  const {
    text: { maxLength: textMaxLength },
  } = validations.userCurrentStatus

  function onBookSelect(book) {
    setSelectedBook(book)
  }

  async function submit() {
    setTextErrorMsg(undefined)

    if (text && text.length > textMaxLength) {
      setTextErrorMsg(`The text of your status cannot be longer than ${textMaxLength} characters.`)
      return
    }

    setIsBusy(true)

    const toastId = toast.loading("Saving...")

    try {
      const createdUserCurrentStatus = await api.userCurrentStatuses.create({
        book: selectedBook,
        text,
      })

      toast.success(`Current status saved!`, { id: toastId })
      onEditSuccess(createdUserCurrentStatus)
    } catch (error: any) {
      console.log(error)
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
      console.log(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return (
    <div>
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
          </div>
        ) : (
          <CoverPlaceholder />
        )}
      </div>
      <div className="my-4">
        <Search isNav={false} onSelect={onBookSelect} fullWidth />
      </div>
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
          className="mr-2 cat-btn cat-btn-sm cat-btn-red-outline text-red-500"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          clear
        </button>
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
      {showDeleteConfirmation && (
        <ConfirmationModal
          title="Clear status?"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirmation(false)}
          isOpen={showDeleteConfirmation}
        />
      )}
    </div>
  )
}