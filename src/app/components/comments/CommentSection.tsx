// CommentSection includes a parent comment component, reply UI, and children comment components

import { useState, useCallback } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import CommentCard from "app/components/comments/CommentCard"
import EditComment from "app/components/comments/EditComment"
import CommentParentType from "enums/CommentParentType"

export default function CommentSection({ comment: _comment, currentUserProfile, onDelete }) {
  const [comment, setComment] = useState<any>(_comment)
  const [isReplying, setIsReplying] = useState<boolean>(false)

  const getComment = useCallback(async () => {
    try {
      const updatedComment = await api.comments.find(comment.id)

      setComment(updatedComment)
    } catch (error: any) {
      reportToSentry(error, { commentId: comment.id })
    }
  }, [comment.id])

  async function handleEditSuccess() {
    setIsReplying(false)
    getComment()
  }

  return (
    <>
      <CommentCard
        comment={comment}
        currentUserProfile={currentUserProfile}
        onDelete={onDelete}
        isReplying={isReplying}
        onClickReply={() => setIsReplying(true)}
      />
      <div className="ml-12">
        {isReplying && (
          <EditComment
            parentId={comment.id}
            parentType={CommentParentType.Comment}
            onEditSuccess={handleEditSuccess}
            onCancel={() => setIsReplying(false)}
          />
        )}

        {comment.comments?.map((childComment) => {
          if (childComment.depth < 2) {
            return (
              <CommentSection
                key={childComment.id}
                comment={childComment}
                currentUserProfile={currentUserProfile}
                onDelete={getComment}
              />
            )
          } else {
            return (
              <CommentCard
                key={childComment.id}
                comment={childComment}
                currentUserProfile={currentUserProfile}
                onDelete={getComment}
              />
            )
          }
        })}
      </div>
    </>
  )
}
