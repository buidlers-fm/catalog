"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import humps from "humps"
import { useTour } from "@reactour/tour"
import { Tooltip } from "react-tooltip"
import { BsJournalText } from "react-icons/bs"
import { FaHeart, FaBookmark } from "react-icons/fa"
import { FaPlus, FaBuildingColumns } from "react-icons/fa6"
import { PiShootingStarFill } from "react-icons/pi"
import { SlInfo } from "react-icons/sl"
import { MdEdit } from "react-icons/md"
import { TbExternalLink } from "react-icons/tb"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import { useModals } from "lib/contexts/ModalsContext"
import api from "lib/api"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getLocalStorage, deleteLocalStorage } from "lib/localstorage"
import {
  INTRO_TOUR_LOCALSTORAGE_KEY,
  INTRO_TOUR_BOOK_PAGE_STEP,
} from "app/components/IntroTourProvider"
import {
  getBookLink,
  getBookEditLink,
  getBookEditLinkWithQueryString,
  getBookNotesLink,
  getBookListsLink,
  getWorldCatUrl,
  getPersonLinkWithOpenLibraryId,
} from "lib/helpers/general"
import { joinStringsWithAnd } from "lib/helpers/strings"
import CopyableLinkButton from "app/components/CopyableLinkButton"
import BookPageConversations from "app/books/components/BookPageConversations"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import Likes from "app/components/Likes"
import UserBookShelfMenu from "app/components/userBookShelves/UserBookShelfMenu"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import BookLinkPostCard from "app/components/bookPosts/BookPostCard"
import ListCard from "app/components/lists/ListCard"
import ExpandableText from "app/components/ExpandableText"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"
import InteractionObjectType from "enums/InteractionObjectType"
import BookReadStatus from "enums/BookReadStatus"
import UserBookShelf, { shelfToCopy } from "enums/UserBookShelf"
import AdaptationCard from "app/components/AdaptationCard"
import CurrentModal from "enums/CurrentModal"
import type { UserProfileProps } from "lib/models/UserProfile"
import type Book from "types/Book"
import type List from "types/List"
import type Like from "types/Like"
import type BookRead from "types/BookRead"
import type BookActivity from "types/BookActivity"

const BOOK_NOTES_LIMIT = 3
const LISTS_LIMIT = 3
const DEFAULT_DESCRIPTION = "No description found."
const DESCRIPTION_MAX_CHARS = 800

let pageUrl
if (typeof window !== "undefined") {
  pageUrl = window.location.href
} else {
  pageUrl = ""
}

export default function BookPage({
  book,
  currentUserProfile,
}: {
  book: Book
  currentUserProfile: UserProfileProps
}) {
  const searchParams = useSearchParams()
  const { fetchShelfAssignments } = useUserBooks()
  const {
    setPotentialCurrentBook,
    setCurrentBook,
    setCurrentModal,
    setExistingBookRead,
    setOnNewNoteSuccess,
  } = useModals()

  const { setCurrentStep, setIsOpen } = useTour()
  useEffect(() => {
    const currentTourStep = getLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY)
    if (currentTourStep === INTRO_TOUR_BOOK_PAGE_STEP) {
      setCurrentStep(currentTourStep)
      setIsOpen(true)
      deleteLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY)
    }
  }, [setCurrentStep, setIsOpen])

  const [bookLists, setBookLists] = useState<List[]>()
  const [bookActivity, setBookActivity] = useState<BookActivity>({} as any)
  const [notes, setNotes] = useState<any[]>()
  const [currentUserNotesAndPosts, setCurrentUserNotesAndPosts] = useState<any[]>()
  const [posts, setPosts] = useState<any[]>()
  const [likeCount, setLikeCount] = useState<number | undefined>(book.likeCount)
  const [currentUserLike, setCurrentUserLike] = useState<Like | undefined>(book.currentUserLike)
  const [imgLoaded, setImgLoaded] = useState<boolean>(false)
  const [showLikeAddNoteTooltip, setShowLikeAddNoteTooltip] = useState<boolean>(false)
  const [showShelvesAddNoteTooltip, setShowShelvesAddNoteTooltip] = useState<boolean>(false)

  useEffect(() => {
    setPotentialCurrentBook(book)
  }, [book, setPotentialCurrentBook])

  const imgRef = useRef(null)

  useEffect(() => {
    if ((imgRef.current as any)?.complete) setImgLoaded(true)
  }, [])

  useEffect(() => {
    async function getBookLists() {
      const _bookLists = await api.lists.get({
        bookId: book.id,
        limit: LISTS_LIMIT,
      })

      setBookLists(_bookLists)
    }

    if (book.id) getBookLists()
  }, [book])

  useEffect(() => {
    async function getBookActivity() {
      const _bookActivity = await api.books.getActivity(book.id)

      setBookActivity(_bookActivity)
    }

    if (book.id) getBookActivity()
  }, [book])

  const getBook = useCallback(async () => {
    try {
      const _book = await api.books.get(book.openLibraryWorkId)
      window.history.replaceState(null, "", getBookLink(_book.slug))
      book.id = _book.id
      return _book
    } catch (error: any) {
      reportToSentry(error, {
        openLibraryWorkId: book.openLibraryWorkId,
        currentUserProfile,
      })
    }
  }, [currentUserProfile, book])

  const getCurrentUserBookNotes = useCallback(
    async (dbBook?) => {
      let bookId = book.id || dbBook?.id
      if (!bookId) bookId = (await getBook()).id

      const notesRequestData = {
        bookId,
        noteTypes: [BookNoteType.JournalEntry],
        requireText: true,
        userProfileId: currentUserProfile.id,
        limit: BOOK_NOTES_LIMIT,
      }

      const postsRequestData = {
        bookId,
        noteTypes: [BookNoteType.Post],
        userProfileId: currentUserProfile.id,
        limit: BOOK_NOTES_LIMIT,
      }

      try {
        const getNotes = api.bookNotes.get(notesRequestData)
        const getPosts = api.bookNotes.get(postsRequestData)

        const [_notes, _posts] = await Promise.all([getNotes, getPosts])

        const _currentUserNotesAndPosts = [..._notes, ..._posts]
          .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
          .slice(0, BOOK_NOTES_LIMIT)

        setCurrentUserNotesAndPosts(_currentUserNotesAndPosts)
      } catch (error: any) {
        reportToSentry(error, {
          method: "BookPage.getCurrentUserBookNotes",
          notesRequestData,
          postsRequestData,
          currentUserProfile,
        })
      }
    },
    [book.id, getBook, currentUserProfile],
  )
  const getBookNotes = useCallback(
    async (dbBook?) => {
      if (currentUserProfile) getCurrentUserBookNotes(dbBook)

      let bookId = book.id || dbBook?.id
      if (!bookId) bookId = (await getBook()).id

      const requestData = {
        bookId,
        noteTypes: [BookNoteType.JournalEntry],
        requireText: true,
        sort: Sort.Popular,
        limit: BOOK_NOTES_LIMIT,
      }

      try {
        const _notes = await api.bookNotes.get(requestData)
        setNotes(_notes)
      } catch (error: any) {
        reportToSentry(error, {
          method: "BookPage.getBookNotes",
          ...requestData,
          currentUserProfile,
        })
      }
    },
    [book.id, getBook, currentUserProfile, getCurrentUserBookNotes],
  )

  const getBookPosts = useCallback(
    async (dbBook?) => {
      if (currentUserProfile) getCurrentUserBookNotes(dbBook)

      let bookId = book.id || dbBook?.id
      if (!bookId) bookId = (await getBook()).id

      const requestData = {
        bookId,
        noteTypes: [BookNoteType.Post],
        sort: Sort.Popular,
        limit: BOOK_NOTES_LIMIT,
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
    },
    [book.id, getBook, currentUserProfile, getCurrentUserBookNotes],
  )

  useEffect(() => {
    if (book.id) {
      getBookNotes()
    } else {
      setNotes([])
    }
  }, [book.id, getBookNotes])

  useEffect(() => {
    const _existingBookRead = findLastUnfinishedBookRead(book.bookReads)
    setExistingBookRead(_existingBookRead)
  }, [book.bookReads, setExistingBookRead])

  useEffect(() => {
    const handleClickOutside = () => {
      if (showLikeAddNoteTooltip) {
        setShowLikeAddNoteTooltip(false)
      }

      if (showShelvesAddNoteTooltip) {
        setShowShelvesAddNoteTooltip(false)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showLikeAddNoteTooltip, showShelvesAddNoteTooltip])

  const findLastUnfinishedBookRead = (bookReads: BookRead[] = []) =>
    bookReads
      .filter((br) => br.status === BookReadStatus.Started)
      .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())[0]

  const onLikeChange = (_likeCount?: number, _currentUserLike?: Like) => {
    setLikeCount(_likeCount)
    setCurrentUserLike(_currentUserLike)
    setShowLikeAddNoteTooltip(true)
  }

  const updateLikes = useCallback(
    async (dbBook) => {
      let bookId = book.id || dbBook?.id
      if (!bookId) bookId = (await getBook()).id

      const { likeCount: _likeCount, currentUserLike: _currentUserLike } = await api.likes.get({
        likedObjectId: bookId!,
        likedObjectType: InteractionObjectType.Book,
        compact: true,
      })

      book.likeCount = _likeCount
      book.currentUserLike = _currentUserLike

      setLikeCount(_likeCount)
      setCurrentUserLike(_currentUserLike)
    },
    [book, getBook],
  )

  const getBookReads = useCallback(
    async (dbBook?) => {
      let bookId = book.id || dbBook?.id
      if (!bookId) bookId = (await getBook()).id

      const requestData = {
        bookId,
        forCurrentUser: true,
      }

      try {
        const _bookReads = await api.bookReads.get(requestData)

        const _lastUnfinishedBookRead = findLastUnfinishedBookRead(_bookReads)

        // in case you add a note, changing the book reads
        // history, and then go to add another note
        setExistingBookRead(_lastUnfinishedBookRead)

        return _bookReads
      } catch (error: any) {
        reportToSentry(error, {
          ...requestData,
          currentUserProfile,
        })
      }
    },
    [book.id, getBook, currentUserProfile, setExistingBookRead],
  )

  const onShelfChange = async (shelf) => {
    const shelvesWithBookReadUpdate = [
      UserBookShelf.CurrentlyReading,
      UserBookShelf.Read,
      UserBookShelf.Abandoned,
    ]

    if (shelvesWithBookReadUpdate.includes(shelf)) {
      const _bookReads = (await getBookReads()) || []
      const lastUpdatedBookRead = _bookReads.sort(
        (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf(),
      )[0]

      // in case you change the shelf and then go to add a note,
      // tells BookNoteModal (and eventually the book notes api route)
      // to use this bookRead rather than create a new one
      setExistingBookRead(lastUpdatedBookRead)

      setShowShelvesAddNoteTooltip(true)
    }
  }

  const refetchBookData = useCallback(async () => {
    const dbBook = await getBook()
    Promise.all([
      updateLikes(dbBook),
      getBookNotes(dbBook),
      getBookReads(dbBook),
      fetchShelfAssignments(),
    ])
  }, [getBook, updateLikes, getBookNotes, getBookReads, fetchShelfAssignments])

  function showModal(modalType: CurrentModal) {
    setOnNewNoteSuccess(() => refetchBookData)
    setCurrentBook(book)
    setCurrentModal(modalType)
  }

  const isSignedIn = !!currentUserProfile

  const totalShelfCounts = humps.decamelizeKeys(bookActivity.totalShelfCounts) || {}
  const totalFavoritedCount = bookActivity.totalFavoritedCount || 0
  const shelvesToFriendsProfiles = bookActivity.shelvesToFriendsProfiles || {}
  const likedByFriendsProfiles = bookActivity.likedByFriendsProfiles || []
  const favoritedByFriendsProfiles = bookActivity.favoritedByFriendsProfiles || []

  const totalShelfCount = (Object.values(totalShelfCounts) as number[]).reduce((a, b) => a + b, 0)

  const showFriendsSection =
    (isSignedIn &&
      ((shelvesToFriendsProfiles && Object.keys(shelvesToFriendsProfiles).length > 0) ||
        (likedByFriendsProfiles && likedByFriendsProfiles.length > 0))) ||
    (favoritedByFriendsProfiles && favoritedByFriendsProfiles.length > 0)

  const description = book.description || DEFAULT_DESCRIPTION

  const worldCatUrl = getWorldCatUrl({ isbn: book.isbn, oclc: book.oclc })

  return (
    <div className="mt-16 max-w-4xl mx-auto">
      <div className="mx-8 lg:mx-16">
        <div className="md:flex">
          <div className="flex-grow-0 flex-shrink-0 w-64 mx-auto mb-16 md:mb-8">
            {book.coverImageUrl && !imgLoaded && <CoverPlaceholder size="lg" loading />}
            {book.coverImageUrl ? (
              <img
                ref={imgRef}
                src={book.coverImageUrl}
                alt="cover"
                className={`${
                  imgLoaded ? "block" : "hidden"
                } object-top mx-auto shadow-md rounded-md`}
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <CoverPlaceholder size="lg" />
            )}
            <div className="flex justify-between items-center my-2">
              <div className="flex items-center">
                <div id="book-likes" className="mx-2 w-fit">
                  <Likes
                    interactive={isSignedIn}
                    likedObject={book}
                    likedObjectType={InteractionObjectType.Book}
                    likeCount={likeCount}
                    currentUserLike={currentUserLike}
                    onChange={onLikeChange}
                  />
                </div>
                {showLikeAddNoteTooltip && (
                  <Tooltip
                    anchorSelect="#book-likes"
                    className="font-mulish"
                    place="bottom-start"
                    clickable
                    isOpen={showLikeAddNoteTooltip}
                  >
                    <button
                      onClick={() => {
                        showModal(CurrentModal.NewNote)
                        setShowLikeAddNoteTooltip(false)
                      }}
                    >
                      <div className="underline">Add a note?</div>
                    </button>
                  </Tooltip>
                )}
                {isSignedIn && (
                  <div id="book-shelves" data-intro-tour="book-shelves" className="ml-2 w-fit">
                    <UserBookShelfMenu book={book} onChange={onShelfChange} />
                  </div>
                )}
              </div>

              <CopyableLinkButton url={pageUrl} />

              {showShelvesAddNoteTooltip && (
                <Tooltip
                  anchorSelect="#book-shelves"
                  className="font-mulish"
                  place="right"
                  clickable
                  isOpen={showShelvesAddNoteTooltip}
                >
                  <button
                    onClick={() => {
                      showModal(CurrentModal.NewNote)
                      setShowShelvesAddNoteTooltip(false)
                    }}
                  >
                    <div className="underline">Edit dates or add a note?</div>
                  </button>
                </Tooltip>
              )}
            </div>

            <div className="flex px-2 font-mulish text-sm text-gray-200">
              {totalShelfCount > 0 && (
                <div>
                  <div id="shelf-count" className="w-fit">
                    on {totalShelfCount} {totalShelfCount === 1 ? "shelf" : "shelves"}
                  </div>
                  <Tooltip anchorSelect="#shelf-count" className="font-mulish">
                    {Object.entries(shelfToCopy).map(([shelfKey, shelfCopy]) => {
                      const count = totalShelfCounts[shelfKey]
                      if (!count) return null // including 0

                      return (
                        <div key={shelfKey}>
                          {count as string} {shelfCopy}
                        </div>
                      )
                    })}
                  </Tooltip>
                </div>
              )}

              {totalShelfCount > 0 && !!totalFavoritedCount && totalFavoritedCount > 0 && (
                <span className="mx-2">•</span>
              )}

              {!!totalFavoritedCount && totalFavoritedCount > 0 && (
                <div>
                  <div className="flex w-fit">
                    {totalFavoritedCount} obsessed
                    <SlInfo
                      id="obsessed-info-icon"
                      className="inline-block mt-1 ml-1.5 text-xs text-gray-300"
                    />
                  </div>
                  <Tooltip anchorSelect="#obsessed-info-icon" className="font-mulish">
                    Number of users who have this book in their top 4.
                  </Tooltip>
                </div>
              )}
            </div>

            {isSignedIn && (
              <div className="mt-4 mb-4 font-mulish">
                <button
                  type="button"
                  onClick={() => showModal(CurrentModal.AddBookToLists)}
                  className="my-1 w-full cat-btn cat-btn-sm bg-gray-800 text-gray-200 hover:text-white"
                >
                  <FaPlus className="inline-block -mt-[5px] mr-1 text-[14px]" /> add to list
                </button>

                <button
                  data-intro-tour="create-note"
                  type="button"
                  onClick={() => showModal(CurrentModal.NewNote)}
                  className="my-1 w-full cat-btn cat-btn-sm bg-gray-800 text-gray-200 hover:text-white"
                >
                  <BsJournalText className="inline-block -mt-[4px] mr-1 text-[16px]" /> add note or
                  log
                </button>

                <button
                  type="button"
                  onClick={() => showModal(CurrentModal.RecommendBook)}
                  className="my-1 w-full cat-btn cat-btn-sm bg-gray-800 text-gray-200 hover:text-white"
                >
                  <PiShootingStarFill className="inline-block -mt-[3px] mr-0.5 text-[18px]" />{" "}
                  recommend to a friend
                </button>

                <Link
                  href={
                    book.slug
                      ? getBookEditLink(book.slug)
                      : getBookEditLinkWithQueryString(searchParams.toString())
                  }
                >
                  <button
                    type="button"
                    className="my-1 cat-btn cat-btn-sm text-left text-sm text-gray-200 hover:text-white"
                  >
                    <MdEdit className="inline-block -mt-[4px] text-sm" /> edit this book
                  </button>
                </Link>
              </div>
            )}

            {worldCatUrl && (
              <div className="mt-8 font-mulish text-sm">
                <div className="cat-eyebrow">
                  <FaBuildingColumns className="inline-block -mt-1.5 mr-1.5" />
                  check nearby libraries
                </div>
                <hr className="my-1 h-[1px] border-none bg-gray-300" />
                <div className="py-1">
                  <a
                    href={worldCatUrl}
                    className="cat-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WorldCat
                  </a>
                  <TbExternalLink className="ml-1 -mt-1 inline-block" />
                </div>
              </div>
            )}

            {book.adaptations && book.adaptations.length > 0 && (
              <div className="mt-8 font-mulish hidden md:block">
                <div className="cat-eyebrow">adaptations</div>
                <hr className="my-1 h-[1px] border-none bg-gray-300" />
                {book.adaptations.map((adaptation) => (
                  <AdaptationCard key={adaptation.id} adaptation={adaptation} compact />
                ))}
              </div>
            )}
          </div>
          <div className="flex-grow mx-auto md:ml-16">
            <h1 className="mb-1 text-4xl font-semibold">
              {book.title}
              <span className="text-xl ml-3 font-normal text-gray-200">
                {book.firstPublishedYear}
              </span>
            </h1>
            {book.isTranslated && (
              <div className="my-2 text-gray-200 text-xl italic">({book.originalTitle})</div>
            )}
            {book.subtitle && <h2 className="my-2 text-xl italic">{book.subtitle}</h2>}
            <h2 className="my-2 text-xl">
              by{" "}
              {book.openLibraryAuthorId ? (
                <Link
                  href={getPersonLinkWithOpenLibraryId(book.openLibraryAuthorId)}
                  className="cat-link"
                >
                  {book.authorName}
                </Link>
              ) : (
                book.authorName
              )}
            </h2>
            <div className="mt-8 mb-4 md:w-11/12">
              <ExpandableText text={description} maxChars={DESCRIPTION_MAX_CHARS} />
            </div>
            {book.description && !book.edited && (
              <div className="px-8 flex justify-end text-sm text-gray-300">— from OpenLibrary</div>
            )}
            <div className="my-8">
              {book.openLibraryWorkId && (
                <div className="">
                  <span className="text-gray-200">
                    {book.editionsCount
                      ? `${
                          book.editionsCount === 1 ? "1 edition" : `${book.editionsCount} editions`
                        } at`
                      : "More at"}
                  </span>{" "}
                  <Link
                    href={OpenLibrary.getOlWorkPageUrl(book.openLibraryWorkId)}
                    className="cat-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenLibrary
                  </Link>
                  <TbExternalLink className="ml-1 -mt-1 inline-block" />
                </div>
              )}

              {book.wikipediaUrl && (
                <div className="">
                  <Link
                    href={book.wikipediaUrl}
                    className="cat-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wikipedia
                  </Link>
                  <TbExternalLink className="ml-1 -mt-1 inline-block" />
                </div>
              )}
            </div>
          </div>

          {book.adaptations && book.adaptations.length > 0 && (
            <div className="mt-8 font-mulish md:hidden">
              <div className="cat-eyebrow">adaptations</div>
              <hr className="my-1 h-[1px] border-none bg-gray-300" />
              {book.adaptations.map((adaptation) => (
                <AdaptationCard key={adaptation.id} adaptation={adaptation} />
              ))}
            </div>
          )}
        </div>

        {showFriendsSection && (
          <div className="my-8 font-mulish">
            <div className="cat-eyebrow">friends</div>
            <hr className="my-1 h-[1px] border-none bg-gray-300" />
            <div className="py-4 font-newsreader">
              {favoritedByFriendsProfiles && favoritedByFriendsProfiles.length > 0 && (
                <div className="mb-2">
                  <FaHeart className="inline-block -mt-0.5 mr-0.5 text-red-300 text-sm" />
                  <FaHeart className="inline-block -mt-0.5 mr-1.5 text-red-300 text-sm" />
                  {joinStringsWithAnd(
                    favoritedByFriendsProfiles.map(
                      (profile) => profile.displayName || profile.username,
                    ),
                  )}{" "}
                  {favoritedByFriendsProfiles.length > 1 ? "have" : "has"} this book in their top 4.
                </div>
              )}

              {likedByFriendsProfiles && likedByFriendsProfiles.length > 0 && (
                <div className="mb-2">
                  <FaHeart className="inline-block -mt-0.5 mr-1.5 text-red-300 text-sm" />
                  {joinStringsWithAnd(
                    likedByFriendsProfiles.map(
                      (profile) => profile.displayName || profile.username,
                    ),
                  )}{" "}
                  loved this book.
                </div>
              )}

              {Object.entries(shelvesToFriendsProfiles).map(([_shelfKey, friendsProfiles]) => {
                if (!friendsProfiles || (friendsProfiles as any[]).length === 0) return null

                const shelfKey = humps.decamelize(_shelfKey)
                const names = (friendsProfiles as any[]).map(
                  (profile) => profile.displayName || profile.username,
                )

                return (
                  <div key={shelfKey} className="my-2">
                    <FaBookmark className="inline-block -mt-0.5 mr-1.5 text-gold-500 text-sm" />
                    {joinStringsWithAnd(names)} shelved this book as{" "}
                    <span className="font-bold">{shelfToCopy[shelfKey]}</span>.
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {currentUserNotesAndPosts && currentUserNotesAndPosts.length > 0 && (
          <div className="mt-8 mb-16 font-mulish">
            <div className="flex justify-between text-gray-300 text-sm">
              <div className="cat-eyebrow">latest by you</div>
            </div>
            <hr className="my-1 h-[1px] border-none bg-gray-300" />
            <div className="">
              {currentUserNotesAndPosts.map((item) => {
                if (item.noteType === BookNoteType.JournalEntry) {
                  return (
                    <BookNoteCard
                      key={item.id}
                      note={item}
                      withCover={false}
                      currentUserProfile={currentUserProfile}
                      onEditSuccess={getBookNotes}
                      onDeleteSuccess={getBookNotes}
                    />
                  )
                } else {
                  return (
                    <BookLinkPostCard
                      key={item.id}
                      post={item}
                      withCover={false}
                      currentUserProfile={currentUserProfile}
                      onEditSuccess={getBookPosts}
                      onDeleteSuccess={getBookPosts}
                    />
                  )
                }
              })}
            </div>
          </div>
        )}

        {notes && notes.length > 0 && (
          <div className="mt-8 mb-16 font-mulish">
            <div className="flex justify-between text-gray-300 text-sm">
              <div className="cat-eyebrow">top notes</div>
              <div className="flex -mt-1">
                <Link className="inline-block mt-1 mx-2" href={getBookNotesLink(book.slug!)}>
                  more
                </Link>
              </div>
            </div>
            <hr className="my-1 h-[1px] border-none bg-gray-300" />
            <div className="">
              {notes.map((note) => (
                <BookNoteCard
                  key={note.id}
                  note={note}
                  withCover={false}
                  currentUserProfile={currentUserProfile}
                  onEditSuccess={getBookNotes}
                  onDeleteSuccess={getBookNotes}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 mb-16 font-mulish">
          <BookPageConversations
            book={book}
            currentUserProfile={currentUserProfile}
            getBook={getBook}
            posts={posts}
            onChange={getCurrentUserBookNotes}
          />
        </div>

        {bookLists && bookLists.length > 0 && (
          <div className="mt-16 font-mulish">
            <div className="flex justify-between text-gray-300 text-sm">
              <div className="cat-eyebrow">as seen in</div>
              <div className="flex -mt-1">
                <Link className="inline-block mt-1 mx-2" href={getBookListsLink(book.slug!)}>
                  more
                </Link>
              </div>
            </div>
            <hr className="my-1 h-[1px] border-none bg-gray-300" />
            <div className="">
              {bookLists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  currentUserProfile={currentUserProfile}
                  withByline
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
