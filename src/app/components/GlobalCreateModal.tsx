"use client"

import Link from "next/link"
import { Dialog } from "@headlessui/react"
import { BsXLg, BsJournalText } from "react-icons/bs"
import { FaPlus, FaRegComment } from "react-icons/fa"
import { useModals } from "lib/contexts/ModalsContext"
import { getBookLinkAgnostic } from "lib/helpers/general"
import Search from "app/components/nav/Search"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import UserBookShelfMenu, {
  MenuButtonShape,
} from "app/components/userBookShelves/UserBookShelfMenu"
import CurrentModal from "enums/CurrentModal"

export default function GlobalCreateModal({
  onClose,
  isOpen,
}: {
  onClose: () => void
  isOpen: boolean
}) {
  const { currentBook, setCurrentBook, potentialCurrentBook, setCurrentModal } = useModals()

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-40">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel
          className={`relative rounded max-h-[90vh] ${
            currentBook && "overflow-y-auto"
          } max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-950 border border-gray-700 px-8 sm:px-16 py-8`}
        >
          <button onClick={onClose} className="absolute top-[24px] right-[24px]">
            <BsXLg className="text-xl" />
          </button>

          {currentBook ? (
            <div className="mt-4 flex flex-col md:flex-row">
              <div className="shrink-0 w-36">
                {currentBook.coverImageUrl ? (
                  <img
                    src={currentBook.coverImageUrl}
                    alt="cover"
                    className="w-full mx-auto shadow-md rounded-md"
                  />
                ) : (
                  <CoverPlaceholder size="md" />
                )}

                <button
                  onClick={() => setCurrentBook(undefined)}
                  className="cat-btn-link text-sm text-gray-300"
                >
                  change book
                </button>
              </div>
              <div className="mt-8 md:mt-0 md:ml-8">
                <div className="">
                  <div className="grow text-2xl font-semibold font-newsreader">
                    {currentBook.title}
                  </div>
                  <div className="text-gray-300 text-lg font-newsreader">
                    by {currentBook.authorName}
                  </div>

                  <div className="my-4">What do you want to do?</div>

                  <div className="my-4">
                    <UserBookShelfMenu
                      book={currentBook}
                      menuButtonShape={MenuButtonShape.Button}
                    />

                    <button
                      type="button"
                      onClick={() => setCurrentModal(CurrentModal.AddBookToLists)}
                      className="block my-4 cat-btn cat-btn-md cat-btn-light-gray text-gray-200 hover:text-white"
                    >
                      <FaPlus className="inline-block -mt-[5px] mr-1 text-[14px]" /> add book to
                      list(s)
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentModal(CurrentModal.NewNote)}
                      className="block my-4 cat-btn cat-btn-md cat-btn-teal text-gray-200 hover:text-white"
                    >
                      <BsJournalText className="inline-block -mt-[4px] mr-1 text-[16px]" /> log this
                      book or write a note
                    </button>

                    <button
                      onClick={() => setCurrentModal(CurrentModal.NewPost)}
                      className="block my-4 cat-btn cat-btn-md cat-btn-green text-gray-200 hover:text-white"
                    >
                      <FaRegComment className="inline-block -mt-[4px] mr-1 text-[16px]" /> create a
                      thread
                    </button>

                    <Link
                      href={getBookLinkAgnostic(currentBook)}
                      className="underline text-gray-300"
                    >
                      go to book page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="cat-eyebrow-uppercase">add to your books, or post about...</div>

              <div className="my-4">
                <Search
                  isNav={false}
                  onSelect={(book) => setCurrentBook(book)}
                  placeholderText="search by title and author"
                  maxHeightClass="max-h-[calc(50vh-96px)]"
                />
              </div>

              {potentialCurrentBook && (
                <div className="text-gray-300">
                  or select{" "}
                  <button
                    onClick={() => setCurrentBook(potentialCurrentBook)}
                    className="text-white text-left leading-normal underline"
                  >
                    {potentialCurrentBook.title}
                  </button>
                </div>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
