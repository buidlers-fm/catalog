import { useState } from "react"
import { toast } from "react-hot-toast"
import { TbTrash } from "react-icons/tb"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import FormTextarea from "app/components/forms/FormTextarea"
import ConfirmationModal from "app/components/ConfirmationModal"
import allValidations from "lib/constants/validations"
import CommentParentType from "enums/CommentParentType"
import type Comment from "types/Comment"

export default function EditComment({
  comment,
  parentId,
  parentType,
  onEditSuccess,
  onDeleteSuccess,
  onCancel,
  showFormattingReferenceTooltip = false,
}: {
  comment?: Comment
  parentId: any
  parentType: CommentParentType
  onEditSuccess: (comment: Comment) => void
  onDeleteSuccess?: () => void
  onCancel?: () => void
  showFormattingReferenceTooltip?: boolean
}) {
  const id = comment?.id
  const _initialText = comment?.text || ""

  const [text, setText] = useState<string>(_initialText)
  const [textErrorMsg, setTextErrorMsg] = useState<string>()
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)

  const validations = allValidations.comment[parentType] || allValidations.comment.post

  const submit = async () => {
    setTextErrorMsg(undefined)
    setIsBusy(true)

    const toastId = toast.loading("Saving...")

    const requestData = {
      text,
      parentType,
      parentId,
    }

    try {
      let savedComment
      if (comment) {
        savedComment = await api.comments.update(id, requestData)
      } else {
        savedComment = await api.comments.create(requestData)

        setText("")
      }

      toast.success(`Comment saved!`, { id: toastId })

      await onEditSuccess(savedComment)
    } catch (error: any) {
      reportToSentry(error, requestData)
      toast.error("Hmm, something went wrong.", { id: toastId })
      setTextErrorMsg(error.message)
    }

    setIsBusy(false)
  }

  const handleDelete = async () => {
    setIsBusy(true)

    const toastId = toast.loading("Deleting...")

    try {
      await api.comments.delete(id)

      toast.success(`Comment deleted!`, { id: toastId })

      if (onDeleteSuccess) {
        await onDeleteSuccess()
      }
    } catch (error: any) {
      reportToSentry(error, { bookNoteId: id })
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  const handleCancel = async () => {
    if (onCancel) {
      await onCancel()
    }
  }

  return (
    <div>
      <FormTextarea
        name="text"
        type="text"
        rows={3}
        remainingChars={validations.text.maxLength - (text?.length || 0)}
        errorMessage={textErrorMsg}
        fullWidth
        bgColor="bg-gray-800"
        showFormattingReferenceTooltip={showFormattingReferenceTooltip}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end">
        {comment && (
          <button
            disabled={isBusy}
            className="mr-2 cat-btn cat-btn-sm cat-btn-red-outline text-red-500"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <TbTrash className="text-xl" />
          </button>
        )}
        {(comment || parentType === CommentParentType.Comment) && (
          <button
            disabled={isBusy}
            className="mr-2 cat-btn cat-btn-sm cat-btn-white-outline"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        <button
          disabled={isBusy || text.length === 0 || text.length > validations.text.maxLength}
          className="cat-btn cat-btn-sm cat-btn-gold"
          onClick={submit}
        >
          Save
        </button>
      </div>
      {showDeleteConfirmation && (
        <ConfirmationModal
          title="Delete this comment?"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirmation(false)}
          isOpen={showDeleteConfirmation}
        />
      )}
    </div>
  )
}
