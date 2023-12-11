import { useState } from "react"
import { toast } from "react-hot-toast"
import { TbTrash } from "react-icons/tb"
import api from "lib/api"
import FormInput from "app/components/forms/FormInput"
import ConfirmationModal from "app/components/ConfirmationModal"
import validations from "app/constants/validations"

export default function EditBookLinkPost({ bookPost, onEditSuccess, onDeleteSuccess, onCancel }) {
  const { id, title: _initialTitle, linkUrl } = bookPost

  const [title, setTitle] = useState<string>(_initialTitle)
  const [titleErrorMsg, setTitleErrorMsg] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)

  const bookPostValidations = validations.bookPost

  const submit = async () => {
    setTitleErrorMsg(undefined)

    if (title.length > validations.bookNote.text.maxLength) {
      setTitleErrorMsg(
        `Title cannot be longer than ${bookPostValidations.title.maxLength} characters.`,
      )
      return
    }

    setIsBusy(true)

    const toastId = toast.loading("Saving...")

    try {
      await api.bookNotes.update(id, { title })

      toast.success(`Post updated!`, { id: toastId })

      await onEditSuccess()
    } catch (error: any) {
      console.log(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
      setTitleErrorMsg(error.message)
    }

    setIsBusy(false)
  }

  const handleDelete = async () => {
    setIsBusy(true)

    const toastId = toast.loading("Deleting...")

    try {
      await api.bookNotes.delete(id)

      toast.success(`Post deleted!`, { id: toastId })

      await onDeleteSuccess()
    } catch (error: any) {
      console.log(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return (
    <div>
      <FormInput
        name="title"
        type="text"
        remainingChars={bookPostValidations.title.maxLength - (title?.length || 0)}
        bgColor="bg-gray-800"
        errorMessage={titleErrorMsg}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          disabled={isBusy}
          className="mr-2 cat-btn cat-btn-red-outline text-red-500"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <TbTrash className="text-xl" />
        </button>
        <button
          disabled={isBusy}
          className="mr-2 cat-btn cat-btn-sm cat-btn-white-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button disabled={isBusy} className="cat-btn cat-btn-sm cat-btn-gold" onClick={submit}>
          Save
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-500 font-mulish">{linkUrl}</div>
      {showDeleteConfirmation && (
        <ConfirmationModal
          title="Delete this post?"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirmation(false)}
          isOpen={showDeleteConfirmation}
        />
      )}
    </div>
  )
}
