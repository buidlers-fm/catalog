"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useUser } from "lib/contexts/UserContext"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
// import FeaturedBooks from "app/explore/components/FeaturedBooks"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import BookLinkPostCard from "app/components/bookPosts/BookPostCard"
import ListCard from "app/components/lists/ListCard"
import LoadingSection from "app/components/LoadingSection"
import Leaderboard from "app/explore/components/Leaderboard"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"

const NOTES_LIMIT = 5
const POSTS_LIMIT = 5
const LISTS_LIMIT = 5
const LEADERBOARD_LIMIT = 10

export default function ExplorePageComponent() {
  const { currentUserProfile } = useUser()

  const [notes, setNotes] = useState<any[]>()
  const [posts, setPosts] = useState<any[]>()
  const [lists, setLists] = useState<any[]>()

  const getLists = useCallback(async () => {
    const _lists = await api.lists.get({
      limit: LISTS_LIMIT,
    })

    setLists(_lists)
  }, [])

  const getNotes = useCallback(async () => {
    const requestData = {
      noteTypes: [BookNoteType.JournalEntry],
      requireText: true,
      sort: Sort.Recent,
      limit: NOTES_LIMIT,
    }

    try {
      const _notes = await api.bookNotes.get(requestData)
      setNotes(_notes)
    } catch (error: any) {
      reportToSentry(error, {
        method: "ExplorePage.getNotes",
        ...requestData,
        currentUserProfile,
      })
    }
  }, [currentUserProfile])

  const getPosts = useCallback(async () => {
    const requestData = {
      noteTypes: [BookNoteType.Post],
      sort: Sort.Recent,
      limit: POSTS_LIMIT,
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
  }, [currentUserProfile])

  const fetchAllData = useCallback(async () => {
    await Promise.all([getNotes(), getPosts(), getLists()])
  }, [getNotes, getPosts, getLists])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return (
    <div className="sm:max-w-3xl sm:mx-auto px-8 sm:px-16 py-8">
      {/* featured books aren't being maintained right now */}
      {/* <div className="mt-8 mb-16">
        <FeaturedBooks />
      </div> */}

      <div className="mt-8 mb-16 font-mulish">
        <div className="flex justify-between items-baseline text-sm">
          <div className="text-3xl -mb-2 font-semibold font-newsreader">recent notes</div>
          <div className="flex -mt-1">
            <Link className="inline-block mt-1 mx-2" href="/explore/notes">
              more
            </Link>
          </div>
        </div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        {notes ? (
          <div className="">
            {notes.map((note) => (
              <BookNoteCard
                key={note.id}
                note={note}
                currentUserProfile={currentUserProfile || undefined}
                onEditSuccess={getNotes}
                onDeleteSuccess={getNotes}
              />
            ))}
          </div>
        ) : (
          <LoadingSection />
        )}
      </div>

      <div className="mt-8 mb-16 font-mulish">
        <div className="flex justify-between items-baseline text-sm">
          <div className="text-3xl -mb-2 font-semibold font-newsreader">
            recent conversations and links
          </div>
          <div className="flex -mt-1">
            <Link className="inline-block mt-1 mx-2" href="/explore/conversations">
              more
            </Link>
          </div>
        </div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        {posts ? (
          <div className="">
            {posts.map((post) => (
              <BookLinkPostCard
                key={post.id}
                post={post}
                currentUserProfile={currentUserProfile || undefined}
                onEditSuccess={getPosts}
                onDeleteSuccess={getPosts}
              />
            ))}
          </div>
        ) : (
          <LoadingSection />
        )}
      </div>

      <div className="mt-16 font-mulish">
        <div className="flex justify-between items-baseline text-sm">
          <div className="text-3xl -mb-2 font-semibold font-newsreader">recent lists</div>
          <div className="flex -mt-1">
            <Link className="inline-block mt-1 mx-2" href="/explore/lists">
              more
            </Link>
          </div>
        </div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        {lists ? (
          <div className="">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                currentUserProfile={currentUserProfile}
                withByline
              />
            ))}
          </div>
        ) : (
          <LoadingSection />
        )}
      </div>

      <div className="mt-16 font-mulish">
        <div className="flex justify-between items-baseline text-sm">
          <div className="text-3xl -mb-2 font-semibold font-newsreader">leaderboard</div>
          <div className="flex -mt-1">
            <Link className="inline-block mt-1 mx-2" href="/explore/leaderboard">
              more
            </Link>
          </div>
        </div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        <Leaderboard limit={LEADERBOARD_LIMIT} />
      </div>
    </div>
  )
}
