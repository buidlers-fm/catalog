"use client"

import { useState, useCallback } from "react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import BookLinkPostCard from "app/components/bookPosts/BookLinkPostCard"
import EditComment from "app/components/comments/EditComment"
import EmptyState from "app/components/EmptyState"
import CommentCard from "app/components/comments/CommentCard"
import CommentParentType from "enums/CommentParentType"

export default function Post({ post, currentUserProfile }) {
  const [comments, setComments] = useState<any[]>(post.comments || [])

  const getComments = useCallback(async () => {
    const requestData = {
      parentType: CommentParentType.BookNote,
      parentId: post.id,
    }

    try {
      const _comments = await api.comments.get(requestData)

      setComments(_comments)
    } catch (error: any) {
      reportToSentry(error, requestData)
    }
  }, [post.id])

  return (
    <div className="my-8 mx-8 ml:max-w-3xl ml:mx-auto">
      <BookLinkPostCard
        post={post}
        currentUserProfile={currentUserProfile}
        withCover
        onEditSuccess={() => {}}
        onDeleteSuccess={() => {}}
      />

      {currentUserProfile && (
        <>
          <div className="mt-8 font-mulish">
            <div className="-mb-2">reply</div>
            <EditComment
              parentId={post.id}
              parentType={CommentParentType.BookNote}
              onEditSuccess={getComments}
              onDeleteSuccess={getComments}
            />
          </div>
          <hr className="my-12 h-[1px] border-none bg-gray-800" />
        </>
      )}

      {comments.length > 0 ? (
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
      ) : (
        <EmptyState text="No comments yet." />
      )}
    </div>
  )
}
