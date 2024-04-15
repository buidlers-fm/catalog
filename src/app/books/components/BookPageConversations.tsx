import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useModals } from "lib/contexts/ModalsContext"
import api from "lib/api"
import BlueskyClient from "lib/bluesky"
import { reportToSentry } from "lib/sentry"
import { getBookPostsLink } from "lib/helpers/general"
import BookPostCard from "app/components/bookPosts/BookPostCard"
import BlueskyPostCardWrapper from "app/components/BlueskyPostCardWrapper"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"
import CurrentModal from "enums/CurrentModal"

const BOOK_POSTS_LIMIT = 3
const BLUESKY_POSTS_LIMIT = 10

enum ConversationsTab {
  Catalog,
  Bluesky,
}

const slugsToFeedUris = {
  "middlemarch-george-eliot":
    "at://did:plc:c23ebk76cyagxpocpr3zfvpe/app.bsky.feed.generator/aaaogozwjpftk",
  "moby-dick-herman-melville":
    "at://did:plc:c23ebk76cyagxpocpr3zfvpe/app.bsky.feed.generator/aaalhofhk5k2m",
}

export default function BookPageConversations({
  book,
  currentUserProfile,
  getBook,
  posts: bookPagePosts,
  onChange,
}) {
  const { setCurrentBook, setCurrentModal, setOnNewPostSuccess } = useModals()

  const [posts, setPosts] = useState<any[]>()
  const [blueskyPosts, setBlueskyPosts] = useState<any[]>()
  const [blueskyNextPage, setBlueskyNextPage] = useState<string>()
  const [conversationsTab, setConversationsTab] = useState<ConversationsTab>(
    ConversationsTab.Catalog,
  )

  const isSignedIn = !!currentUserProfile

  useEffect(() => {
    if (bookPagePosts) {
      setPosts(bookPagePosts)
    }
  }, [bookPagePosts])

  useEffect(() => {
    async function getBlueskyPosts(feedUri) {
      const { posts: _blueskyPosts, nextPage: _nextPage } = await BlueskyClient.getFeed(feedUri, {
        limit: BLUESKY_POSTS_LIMIT,
      })

      setBlueskyPosts(_blueskyPosts)
      setBlueskyNextPage(_nextPage)
    }

    const feedUri = slugsToFeedUris[book.slug!]
    if (feedUri) {
      getBlueskyPosts(feedUri)
    }
  }, [book.slug])

  useEffect(() => {
    if (posts && posts.length === 0 && blueskyPosts && blueskyPosts.length > 0) {
      setConversationsTab(ConversationsTab.Bluesky)
    } else {
      setConversationsTab(ConversationsTab.Catalog)
    }
  }, [posts, blueskyPosts])

  const getBookPosts = useCallback(
    async (dbBook?) => {
      let bookId = book.id || dbBook?.id
      if (!bookId) bookId = (await getBook()).id

      const requestData = {
        bookId,
        noteTypes: [BookNoteType.Post],
        sort: Sort.Popular,
      }

      try {
        const _posts = await api.bookNotes.get(requestData)
        setPosts(_posts.slice(0, BOOK_POSTS_LIMIT))
      } catch (error: any) {
        reportToSentry(error, {
          ...requestData,
          currentUserProfile,
        })
      }
    },
    [book.id, getBook, currentUserProfile],
  )

  const handleChange = useCallback(() => {
    if (onChange) onChange()
    return getBookPosts()
  }, [getBookPosts, onChange])

  const handleCreatedPost = useCallback(async () => {
    console.log("onNewPostSuccess, running")
    setConversationsTab(ConversationsTab.Catalog)
    if (onChange) onChange()
    return getBookPosts()
  }, [getBookPosts, onChange])

  useEffect(() => {
    if (book.id) {
      getBookPosts()
    } else {
      setPosts([])
    }
  }, [book.id, getBookPosts])

  const getMoreBlueskyPosts = async () => {
    const { posts: nextPosts, nextPage: _nextPage } = await BlueskyClient.getFeed(
      "at://did:plc:c23ebk76cyagxpocpr3zfvpe/app.bsky.feed.generator/aaaogozwjpftk",
      {
        limit: BLUESKY_POSTS_LIMIT,
        nextPage: blueskyNextPage,
      },
    )

    setBlueskyPosts([...(blueskyPosts || []), ...nextPosts])
    setBlueskyNextPage(_nextPage)
  }

  function showModal(modalType: CurrentModal) {
    console.log("setting onNewPostSuccess")
    setOnNewPostSuccess(() => handleCreatedPost)
    setCurrentBook(book)
    setCurrentModal(modalType)
  }

  return (
    <>
      <div className="flex justify-between text-gray-300 text-sm">
        <div className="py-1 flex flex-wrap items-center">
          <div className="cat-eyebrow mr-4">
            top conversations{blueskyPosts && blueskyPosts.length > 0 && " on"}
          </div>

          {blueskyPosts && blueskyPosts.length > 0 && (
            <div className="flex">
              <button
                onClick={() => setConversationsTab(ConversationsTab.Catalog)}
                className={`
        ${
          conversationsTab === ConversationsTab.Catalog
            ? "text-gold-500 border-b border-b-gold-500"
            : "text-gray-500"
        } mr-4 text-sm
        `}
              >
                catalog
              </button>
              <button
                onClick={() => setConversationsTab(ConversationsTab.Bluesky)}
                className={`
        ${
          conversationsTab === ConversationsTab.Bluesky
            ? "text-gold-500 border-b border-b-gold-500"
            : "text-gray-500"
        } text-sm
        `}
              >
                bluesky
              </button>
            </div>
          )}
        </div>

        {conversationsTab === ConversationsTab.Catalog &&
          (isSignedIn ? (
            <div className="flex -mt-1 items-end">
              <button
                data-intro-tour="create-thread"
                onClick={() => showModal(CurrentModal.NewPost)}
                className="cat-btn cat-btn-sm cat-btn-gray mx-2"
              >
                +<span className="hidden sm:inline"> create a thread</span>
              </button>
              <Link className="inline-block mb-1 mx-2" href={getBookPostsLink(book.slug!)}>
                more
              </Link>
            </div>
          ) : (
            <div className="flex items-center">
              <Link href={getBookPostsLink(book.slug!)}>more</Link>
            </div>
          ))}
      </div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />

      {conversationsTab === ConversationsTab.Catalog && (
        <div className="">
          {posts ? (
            posts.length > 0 ? (
              <div>
                {posts.map((post) => (
                  <BookPostCard
                    key={post.id}
                    post={post}
                    withCover={false}
                    currentUserProfile={currentUserProfile}
                    onEditSuccess={handleChange}
                    onDeleteSuccess={handleChange}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="No conversations on catalog yet." />
            )
          ) : (
            <LoadingSection />
          )}
        </div>
      )}

      {conversationsTab === ConversationsTab.Bluesky && (
        <div className="max-w-xl mx-auto mt-8 h-[600px] overflow-auto px-4 bg-gray-950 rounded">
          {blueskyPosts ? (
            blueskyPosts.length > 0 ? (
              <div>
                {blueskyPosts.map((post) => (
                  <BlueskyPostCardWrapper key={post.cid} post={post} />
                ))}
                {blueskyNextPage && (
                  <div className="px-2 py-4 text-center">
                    <button className="font-mulish" onClick={getMoreBlueskyPosts}>
                      load more
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState text="No Bluesky posts yet." />
            )
          ) : (
            <LoadingSection />
          )}
        </div>
      )}
    </>
  )
}
