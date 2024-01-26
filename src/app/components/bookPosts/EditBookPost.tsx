import { useState } from "react"
import { toast } from "react-hot-toast"
import { TbTrash } from "react-icons/tb"
import { useForm } from "react-hook-form"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import FormToggle from "app/components/forms/FormToggle"
import ConfirmationModal from "app/components/ConfirmationModal"
import validations from "lib/constants/validations"

export default function EditBookLinkPost({ bookPost, onEditSuccess, onDeleteSuccess, onCancel }) {
  const { id, title: _initialTitle, linkUrl, text: _initialText, hasSpoilers } = bookPost

  const [title, setTitle] = useState<string>(_initialTitle)
  const [titleErrorMsg, setTitleErrorMsg] = useState<string>()
  const [text, setText] = useState<string>(_initialText || "")
  const [textErrorMsg, setTextErrorMsg] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)

  const bookPostValidations = validations.bookPost

  const { control, watch } = useForm<{ hasSpoilers: boolean }>()

  const hasSpoilersValue = watch("hasSpoilers")

  const submit = async () => {
    setTitleErrorMsg(undefined)

    if (title.length > validations.bookNote.text.maxLength) {
      setTitleErrorMsg(
        `Title cannot be longer than ${bookPostValidations.title.maxLength} characters.`,
      )
      return
    }

    if (text.length > validations.bookNote.text.maxLength) {
      setTextErrorMsg(
        `Text cannot be longer than ${bookPostValidations.text.maxLength} characters.`,
      )
      return
    }

    setIsBusy(true)

    const toastId = toast.loading("Saving...")

    const requestData = {
      title,
      text,
      hasSpoilers: hasSpoilersValue,
    }

    try {
      await api.bookNotes.update(id, requestData)

      toast.success(`Post updated!`, { id: toastId })

      await onEditSuccess()
    } catch (error: any) {
      reportToSentry(error, { bookPostId: id, ...requestData })
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
      reportToSentry(error, { bookPostId: id })
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  const readyToSubmit =
    !!title &&
    !(title.length > bookPostValidations.title.maxLength) &&
    !(!!text && text.length > bookPostValidations.text.maxLength)

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

      <FormTextarea
        labelText="text"
        name="text"
        type="text"
        rows={3}
        remainingChars={bookPostValidations.text.maxLength - (text?.length || 0)}
        errorMessage={textErrorMsg}
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

      <div className="flex justify-end">
        <button
          disabled={isBusy}
          className="mr-2 cat-btn cat-btn-red-outline text-red-500"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <TbTrash className="text-xl" />
        </button>
        <button
          disabled={isBusy && readyToSubmit}
          className="mr-2 cat-btn cat-btn-sm cat-btn-white-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          disabled={isBusy && readyToSubmit}
          className="cat-btn cat-btn-sm cat-btn-gold"
          onClick={submit}
        >
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
