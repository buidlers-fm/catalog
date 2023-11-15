"use client"

import Link from "next/link"
import { useState } from "react"
import { FaPlus } from "react-icons/fa6"
import { GiOpenBook } from "react-icons/gi"
import OpenLibrary from "lib/openLibrary"
import { getBookListsLink } from "lib/helpers/general"
import AddBookToListsModal from "app/lists/components/AddBookToListsModal"
import ListCard from "app/components/lists/ListCard"
import type Book from "types/Book"
import type List from "types/List"

export default function BookPage({
  book,
  userLists,
  bookLists,
  isSignedIn,
}: {
  book: Book
  userLists: List[]
  bookLists?: List[]
  isSignedIn: boolean
}) {
  const [showAddBookToListsModal, setShowAddBookToListsModal] = useState<boolean>(false)

  return (
    <>
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="mx-8 md:mx-8 lg:mx-16">
          <div className="md:flex">
            <div className="flex-grow-0 flex-shrink-0 w-72 mx-auto mb-16">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt="cover"
                  className="object-top mx-auto shadow-md rounded-md"
                />
              ) : (
                <div className="w-[288px] h-[460px] shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
                  <GiOpenBook className="mt-0 text-9xl text-gray-500" />
                </div>
              )}
              {isSignedIn && (
                <div className="my-8 font-mulish">
                  <button
                    type="button"
                    onClick={() => setShowAddBookToListsModal(true)}
                    className="w-full bg-gray-800 py-2 px-4 text-gray-200 hover:text-white"
                  >
                    <FaPlus className="inline-block -mt-[5px] mr-1 text-[14px]" /> Add to list
                  </button>
                </div>
              )}
            </div>
            <div className="flex-grow mx-auto md:ml-16">
              <h1 className="mb-1 text-4xl font-semibold">
                {book.title}
                <span className="text-xl ml-3 font-normal text-gray-200">{book.publishDate}</span>
              </h1>
              {book.subtitle && <h2 className="my-2 text-xl italic">{book.subtitle}</h2>}
              <h2 className="my-2 text-xl">by {book.authorName}</h2>
              <div className="my-8 whitespace-pre-wrap md:w-11/12">{book.description}</div>
              <div className="my-8">
                {book.openLibraryWorkId && (
                  <div className="my-2">
                    <span className="text-gray-200">More at</span>{" "}
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
          {bookLists && bookLists.length > 0 && (
            <div className="mt-8 font-mulish">
              <div className="flex justify-between text-gray-300 text-sm">
                <div className="uppercase tracking-wider">As seen in</div>
                <div className="flex -mt-1">
                  <Link className="inline-block mt-1 mx-2" href={getBookListsLink(book.slug!)}>
                    See all
                  </Link>
                </div>
              </div>
              <hr className="my-1 h-[1px] border-none bg-gray-300" />
              <div className="">
                {bookLists.map((list) => (
                  <ListCard key={list.id} list={list} withByline />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isSignedIn && (
        <AddBookToListsModal
          book={book}
          userLists={userLists}
          isOpen={showAddBookToListsModal}
          onClose={() => setShowAddBookToListsModal(false)}
        />
      )}
    </>
  )
}
