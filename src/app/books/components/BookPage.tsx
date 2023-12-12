"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { BsJournalText } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6"
import api from "lib/api"
import OpenLibrary from "lib/openLibrary"
import { getBookNotesLink, getBookPostsLink, getBookListsLink } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import AddBookToListsModal from "app/lists/components/AddBookToListsModal"
import LogBookModal from "app/components/LogBookModal"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import NewBookPostModal from "app/components/NewBookPostModal"
import BookLinkPostCard from "app/components/bookPosts/BookLinkPostCard"
import ListCard from "app/components/lists/ListCard"
import BookNoteType from "enums/BookNoteType"
import CustomMarkdown from "app/components/CustomMarkdown"
import type { UserProfileProps } from "lib/models/UserProfile"
import type Book from "types/Book"
import type List from "types/List"
import type BookNote from "types/BookNote"

const BOOK_NOTES_LIMIT = 3
const LISTS_LIMIT = 3

export default function BookPage({
  book,
  userLists,
  bookLists,
  isSignedIn,
  currentUserProfile,
}: {
  book: Book
  userLists: List[]
  bookLists?: List[]
  isSignedIn: boolean
  currentUserProfile: UserProfileProps
}) {
  const [allBookNotes, setAllBookNotes] = useState<any[]>(book.bookNotes || [])
  const [notes, setNotes] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [imgLoaded, setImgLoaded] = useState<boolean>(false)
  const [showAddBookToListsModal, setShowAddBookToListsModal] = useState<boolean>(false)
  const [showLogBookModal, setShowLogBookModal] = useState<boolean>(false)
  const [showNewBookPostModal, setShowNewBookPostModal] = useState<boolean>(false)

  const imgRef = useRef(null)

  function filterForNotes(bookNotes?: BookNote[]) {
    return (bookNotes || [])
      .filter((bookNote) => bookNote.noteType === BookNoteType.JournalEntry && !!bookNote.text)
      .slice(0, BOOK_NOTES_LIMIT)
  }

  function filterForPosts(bookNotes?: BookNote[]) {
    return (bookNotes || [])
      .filter(
        (bookNote) =>
          bookNote.noteType === BookNoteType.LinkPost ||
          bookNote.noteType === BookNoteType.TextPost,
      )
      .slice(0, BOOK_NOTES_LIMIT)
  }

  useEffect(() => {
    if ((imgRef.current as any)?.complete) setImgLoaded(true)
  }, [])

  useEffect(() => {
    const _notes = filterForNotes(allBookNotes)
    setNotes(_notes)

    const _posts = filterForPosts(allBookNotes)
    setPosts(_posts)
  }, [allBookNotes])

  const getBookNotes = async () => {
    try {
      const _allBookNotes = await api.bookNotes.get({
        bookId: book.id,
      })
      setAllBookNotes(_allBookNotes)
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="mx-8 lg:mx-16">
          <div className="md:flex">
            <div className="flex-grow-0 flex-shrink-0 w-64 mx-auto mb-16">
              {book.coverImageUrl && !imgLoaded && <CoverPlaceholder loading />}
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
                <CoverPlaceholder />
              )}
              {isSignedIn && (
                <div className="my-8 font-mulish">
                  <button
                    type="button"
                    onClick={() => setShowAddBookToListsModal(true)}
                    className="my-1 w-full cat-btn cat-btn-sm bg-gray-800 text-gray-200 hover:text-white"
                  >
                    <FaPlus className="inline-block -mt-[5px] mr-1 text-[14px]" /> Add to list
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogBookModal(true)}
                    className="my-1 w-full cat-btn cat-btn-sm bg-gray-800 text-gray-200 hover:text-white"
                  >
                    <BsJournalText className="inline-block -mt-[4px] mr-1 text-[16px]" /> Log this
                    book
                  </button>
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
              <h2 className="my-2 text-xl">by {book.authorName}</h2>
              <div className="my-8 whitespace-pre-wrap md:w-11/12">
                <CustomMarkdown markdown={book.description} />
              </div>
              <div className="my-8">
                {book.openLibraryWorkId && (
                  <div className="my-2">
                    <span className="text-gray-200">
                      {book.editionsCount
                        ? `${
                            book.editionsCount === 1
                              ? "1 edition"
                              : `${book.editionsCount} editions`
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {notes.length > 0 && (
            <div className="mt-8 font-mulish">
              <div className="flex justify-between text-gray-300 text-sm">
                <div className="cat-eyebrow">Recent notes</div>
                <div className="flex -mt-1">
                  <Link className="inline-block mt-1 mx-2" href={getBookNotesLink(book.slug!)}>
                    See all
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

          <div className="mt-16 font-mulish">
            <div className="flex justify-between text-gray-300 text-sm">
              <div className="cat-eyebrow">Recent links</div>
              <div className="flex -mt-1">
                {isSignedIn && (
                  <button
                    onClick={() => setShowNewBookPostModal(true)}
                    className="cat-btn cat-btn-sm cat-btn-gray mx-2 mb-1 xs:mb-0"
                  >
                    + Add a link
                  </button>
                )}
                <Link
                  className={`inline-block ${isSignedIn ? "my-1 xs:mb-0" : ""} mx-2`}
                  href={getBookPostsLink(book.slug!)}
                >
                  See all
                </Link>
              </div>
            </div>
            <hr className="my-1 h-[1px] border-none bg-gray-300" />
            <div className="">
              {posts.length > 0 ? (
                <div>
                  {posts.map((post) => (
                    <BookLinkPostCard
                      key={post.id}
                      post={post}
                      withCover={false}
                      currentUserProfile={currentUserProfile}
                      onEditSuccess={getBookNotes}
                      onDeleteSuccess={getBookNotes}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
                  No links yet.
                </div>
              )}
            </div>
          </div>

          {bookLists && bookLists.length > 0 && (
            <div className="mt-16 font-mulish">
              <div className="flex justify-between text-gray-300 text-sm">
                <div className="cat-eyebrow">As seen in</div>
                <div className="flex -mt-1">
                  <Link className="inline-block mt-1 mx-2" href={getBookListsLink(book.slug!)}>
                    See all
                  </Link>
                </div>
              </div>
              <hr className="my-1 h-[1px] border-none bg-gray-300" />
              <div className="">
                {bookLists.slice(0, LISTS_LIMIT).map((list) => (
                  <ListCard key={list.id} list={list} withByline />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isSignedIn && (
        <>
          <AddBookToListsModal
            book={book}
            userLists={userLists}
            isOpen={showAddBookToListsModal}
            onClose={() => setShowAddBookToListsModal(false)}
          />
          <LogBookModal
            book={book}
            isOpen={showLogBookModal}
            onClose={() => setShowLogBookModal(false)}
            onSuccess={getBookNotes}
          />
          <NewBookPostModal
            book={book}
            isOpen={showNewBookPostModal}
            onClose={() => setShowNewBookPostModal(false)}
            onSuccess={getBookNotes}
          />
        </>
      )}
    </>
  )
}
