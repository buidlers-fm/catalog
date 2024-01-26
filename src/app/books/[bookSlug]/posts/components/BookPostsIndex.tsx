"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { getBookLink } from "lib/helpers/general"
import BookPostCard from "app/components/bookPosts/BookPostCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"
import { reportToSentry } from "lib/sentry"

export default function BookPostsIndex({ book, currentUserProfile }) {
  const [posts, setPosts] = useState<any[]>()

  const getBookPosts = useCallback(async () => {
    const requestData = {
      bookId: book.id,
      noteTypes: [BookNoteType.Post],
      sort: Sort.Popular,
    }

    try {
      const _posts = await api.bookNotes.get(requestData)

      setPosts(_posts)
    } catch (error: any) {
      reportToSentry(error, {
        ...requestData,
        currentUserProfile,
      })
    }
  }, [book.id, currentUserProfile])

  useEffect(() => {
    getBookPosts()
  }, [getBookPosts])

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-eyebrow">Posts on</div>
      <Link href={getBookLink(book.slug)}>
        <h1 className="my-2 text-4xl font-semibold font-newsreader">{book.title}</h1>
      </Link>
      <div className="mt-4">
        {posts ? (
          posts.length > 0 ? (
            <div className="">
              {posts.map((post) => (
                <BookPostCard
                  key={post.id}
                  post={post}
                  currentUserProfile={currentUserProfile}
                  withCover={false}
                  onEditSuccess={getBookPosts}
                  onDeleteSuccess={getBookPosts}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="No posts yet." />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
