"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import BookPostCard from "app/components/bookPosts/BookPostCard"
import EditComment from "app/components/comments/EditComment"
import EmptyState from "app/components/EmptyState"
import CommentSection from "app/components/comments/CommentSection"
import CommentParentType from "enums/CommentParentType"

export default function Post({ post, currentUserProfile }) {
  const router = useRouter()

  const [comments, setComments] = useState<any[]>(post.comments || [])

  const getComments = useCallback(async () => {
    const requestData = {
      parentType: CommentParentType.Post,
      parentId: post.id,
    }

    try {
      const _comments = await api.comments.get(requestData)

      setComments(_comments)
    } catch (error: any) {
      reportToSentry(error, requestData)
    }
  }, [post.id])

  async function handleEditSuccess() {
    router.refresh()
  }

  async function handleDeleteSuccess() {
    router.back()
  }

  return (
    <div className="my-8 mx-8 ml:max-w-3xl ml:mx-auto">
      <BookPostCard
        post={post}
        showText
        currentUserProfile={currentUserProfile}
        withCover
        onEditSuccess={handleEditSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {currentUserProfile && (
        <>
          <div className="mt-8 font-mulish">
            <div className="-mb-2">reply</div>
            <EditComment
              parentId={post.id}
              parentType={CommentParentType.Post}
              onEditSuccess={getComments}
              onDeleteSuccess={getComments}
              showFormattingReferenceTooltip
            />
          </div>
          <hr className="my-12 h-[1px] border-none bg-gray-800" />
        </>
      )}

      {comments.length > 0 ? (
        <div className="mt-8">
          {comments.map((comment) => (
            <CommentSection
              key={comment.id}
              comment={comment}
              currentUserProfile={currentUserProfile}
              onDelete={getComments}
            />
          ))}
        </div>
      ) : (
        <EmptyState text="No comments yet." />
      )}
    </div>
  )
}
