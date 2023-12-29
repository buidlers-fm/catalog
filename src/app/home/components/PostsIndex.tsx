"use client"

import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import BookLinkPostCard from "app/components/bookPosts/BookLinkPostCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"
import { reportToSentry } from "lib/sentry"

export default function PostsIndex({ posts: _posts, currentUserProfile }) {
  const [posts, setPosts] = useState<any[]>(_posts)

  const getBookPosts = useCallback(async () => {
    const requestData = {
      noteTypes: [BookNoteType.LinkPost, BookNoteType.TextPost],
      sort: Sort.Recent,
    }

    try {
      const _updatedPosts = await api.bookNotes.get(requestData)

      setPosts(_updatedPosts)
    } catch (error: any) {
      reportToSentry(error, {
        ...requestData,
        currentUserProfile,
      })
    }
  }, [currentUserProfile])

  useEffect(() => {
    if (!!_posts && _posts.length > 0) return

    getBookPosts()
  }, [getBookPosts, _posts])

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="mb-2 text-sm">Recent links from around catalog.</div>
      {posts ? (
        posts.length > 0 ? (
          posts.map((post) => (
            <BookLinkPostCard
              key={post.id}
              post={post}
              currentUserProfile={currentUserProfile}
              withCover
              onEditSuccess={getBookPosts}
              onDeleteSuccess={getBookPosts}
            />
          ))
        ) : (
          <EmptyState text="No recent links." />
        )
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
