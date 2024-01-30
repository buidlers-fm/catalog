import { useState } from "react"
import { toast } from "react-hot-toast"
import { TbTrash } from "react-icons/tb"
import { useForm } from "react-hook-form"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import FormTextarea from "app/components/forms/FormTextarea"
import FormToggle from "app/components/forms/FormToggle"
import ConfirmationModal from "app/components/ConfirmationModal"
import validations from "lib/constants/validations"

export default function EditBookNote({ bookNote, onEditSuccess, onDeleteSuccess, onCancel }) {
  const { id, hasSpoilers, text: _initialText } = bookNote

  const [text, setText] = useState<string>(_initialText)
  const [textErrorMsg, setTextErrorMsg] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)

  const { control, watch } = useForm<{ hasSpoilers: boolean }>()

  const bookNoteValidations = validations.bookNote

  const hasSpoilersValue = watch("hasSpoilers")

  const submit = async () => {
    setTextErrorMsg(undefined)

    if (text.length > validations.bookNote.text.maxLength) {
      setTextErrorMsg(
        `The text of your note cannot be longer than ${bookNoteValidations.text.maxLength} characters.`,
      )
      return
    }

    setIsBusy(true)

    const toastId = toast.loading("Saving...")

    const requestData = {
      text,
      hasSpoilers: hasSpoilersValue,
    }

    try {
      await api.bookNotes.update(id, requestData)

      toast.success(`Note updated!`, { id: toastId })

      await onEditSuccess()
    } catch (error: any) {
      reportToSentry(error, { bookNoteId: id, ...requestData })
      toast.error("Hmm, something went wrong.", { id: toastId })
      setTextErrorMsg(error.message)
    }

    setIsBusy(false)
  }

  const handleDelete = async () => {
    setIsBusy(true)

    const toastId = toast.loading("Deleting...")

    try {
      await api.bookNotes.delete(id)

      toast.success(`Note deleted!`, { id: toastId })

      await onDeleteSuccess()
    } catch (error: any) {
      reportToSentry(error, { bookNoteId: id })
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return (
    <div>
      <FormTextarea
        name="text"
        type="text"
        rows={5}
        remainingChars={bookNoteValidations.text.maxLength - (text?.length || 0)}
        errorMessage={textErrorMsg}
        fullWidth
        bgColor="bg-gray-800"
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
        <button
          disabled={isBusy || (!!text && text.length > bookNoteValidations.text.maxLength)}
          className="cat-btn cat-btn-sm cat-btn-gold"
          onClick={submit}
        >
          Save
        </button>
      </div>
      {showDeleteConfirmation && (
        <ConfirmationModal
          title="Delete this note?"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirmation(false)}
          isOpen={showDeleteConfirmation}
        />
      )}
    </div>
  )
}
