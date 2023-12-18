"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { getBookLink } from "lib/helpers/general"
import BookLinkPostCard from "app/components/bookPosts/BookLinkPostCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"

export default function BookPostsIndex({ book, currentUserProfile }) {
  const [posts, setPosts] = useState<any[]>()

  const getBookPosts = useCallback(async () => {
    try {
      const _posts = await api.bookNotes.get({
        bookId: book.id,
        noteTypes: [BookNoteType.LinkPost, BookNoteType.TextPost],
        sort: Sort.Popular,
      })

      setPosts(_posts)
    } catch (error: any) {
      console.log(error)
    }
  }, [book.id])

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
                <BookLinkPostCard
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
