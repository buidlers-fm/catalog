"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import EditComment from "app/components/comments/EditComment"
import CommentCard from "app/components/comments/CommentCard"
import CommentParentType from "enums/CommentParentType"

export default function Note({ note, currentUserProfile }) {
  const router = useRouter()

  const [comments, setComments] = useState<any[]>(note.comments || [])

  const getComments = useCallback(async () => {
    const requestData = {
      parentType: CommentParentType.Note,
      parentId: note.id,
    }

    try {
      const _comments = await api.comments.get(requestData)

      setComments(_comments)
    } catch (error: any) {
      reportToSentry(error, requestData)
    }
  }, [note.id])

  async function handleEditSuccess() {
    router.refresh()
  }

  async function handleDeleteSuccess() {
    router.back()
  }

  const replyAnchorId = "reply"

  return (
    <div className="my-8 mx-8 ml:max-w-3xl ml:mx-auto">
      <BookNoteCard
        note={note}
        currentUserProfile={currentUserProfile}
        onEditSuccess={handleEditSuccess}
        onDeleteSuccess={handleDeleteSuccess}
        commentsAnchorId={replyAnchorId}
      />

      {comments.length > 0 && (
        <div className="mt-8">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserProfile={currentUserProfile}
              onDelete={getComments}
            />
          ))}
        </div>
      )}

      {currentUserProfile && (
        <div id={replyAnchorId} className="mt-8 font-mulish">
          <div className="-mb-2">reply</div>
          <EditComment
            parentId={note.id}
            parentType={CommentParentType.Note}
            onEditSuccess={getComments}
            onDeleteSuccess={getComments}
            showFormattingReferenceTooltip
          />
        </div>
      )}
    </div>
  )
}
