"use client"

import { useState, useEffect } from "react"
import { Menu } from "@headlessui/react"
import { Float } from "@headlessui-float/react"
import { FaBookmark, FaRegBookmark } from "react-icons/fa"
import toast from "react-hot-toast"
import { reportToSentry } from "lib/sentry"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import UserBookShelf, { shelfToCopy } from "enums/UserBookShelf"
import type Book from "types/Book"

const SHELVES = Object.values(UserBookShelf)

enum MenuButtonShape {
  Icon,
  Button,
}

type Props = {
  book: Book
  onChange?: (shelf: UserBookShelf) => void
  compact?: boolean
  menuButtonShape?: MenuButtonShape
}

export default function UserBookShelfMenu({
  book,
  onChange,
  compact = false,
  menuButtonShape = MenuButtonShape.Icon,
}: Props) {
  const { bookIdsToShelves, shelveBook, unshelveBook, isLoading } = useUserBooks()
  const currentUserShelf = book.id ? bookIdsToShelves[book.id] : undefined

  const [selectedShelf, setSelectedShelf] = useState<UserBookShelf | undefined>(currentUserShelf)

  useEffect(() => {
    setSelectedShelf(currentUserShelf)
  }, [currentUserShelf])

  function isCurrentShelf(shelf) {
    return selectedShelf === shelf
  }

  async function handleShelveBook(shelf) {
    // optimistic update
    const originalSelectedShelf = selectedShelf
    setSelectedShelf(shelf)

    const requestData = {
      book,
      shelf,
    }

    const toastId = toast.loading("Updating shelf...")

    try {
      await shelveBook(book, shelf)

      toast.success(`Added book to your "${shelfToCopy[shelf]}" shelf!`, { id: toastId })

      if (onChange) await onChange(shelf)
    } catch (error: any) {
      setSelectedShelf(originalSelectedShelf)
      toast.error("Hmm, something went wrong.", { id: toastId })
      reportToSentry(error, {
        ...requestData,
        method: "handleShelveBook",
      })
    }
  }

  async function handleUnshelveBook() {
    // optimistic update
    const originalSelectedShelf = selectedShelf
    setSelectedShelf(undefined)

    const requestData = {
      bookId: book.id,
    }

    const toastId = toast.loading("Removing book from shelf...")

    try {
      await unshelveBook(book.id!)

      toast.success("Removed book from your shelf!", { id: toastId })
    } catch (error: any) {
      setSelectedShelf(originalSelectedShelf)
      toast.error("Hmm, something went wrong.", { id: toastId })
      reportToSentry(error, {
        ...requestData,
        method: "handleUnshelveBook",
      })
    }
  }

  async function handleSelectShelf(shelf) {
    if (isCurrentShelf(shelf)) {
      await handleUnshelveBook()
    } else {
      await handleShelveBook(shelf)
    }
  }

  if (isLoading && menuButtonShape === MenuButtonShape.Icon) {
    return <FaBookmark className="text-gray-500 text-sm animate-pulse" />
  }

  return (
    <Menu>
      <Float placement="right" offset={10} flip>
        {menuButtonShape === MenuButtonShape.Icon ? (
          <Menu.Button className="flex items-center cat-btn-text text-sm">
            {selectedShelf ? (
              <div className="flex items-center">
                <FaBookmark className="text-gold-500 text-sm" />
                {!compact && <div className="ml-1.5">{shelfToCopy[selectedShelf]}</div>}
              </div>
            ) : (
              <div className="flex items-center text-gray-300">
                <FaRegBookmark className="text-gray-300 text-sm" />
                {!compact && <div className="ml-1.5">shelves</div>}
              </div>
            )}
          </Menu.Button>
        ) : (
          <Menu.Button className="block my-4 cat-btn cat-btn-md cat-btn-gold" disabled={isLoading}>
            <FaRegBookmark className="inline-block -mt-1 mr-1 text-[16px]" /> shelve book
          </Menu.Button>
        )}
        <Menu.Items className="w-[144px] bg-gray-900 rounded">
          {SHELVES.map((shelf) => (
            <Menu.Item key={shelf}>
              <button
                onClick={() => handleSelectShelf(shelf)}
                className={`w-full hover:bg-gray-700 px-4 py-3 ${
                  isCurrentShelf(shelf) ? "text-gold-500" : "text-white"
                } text-left text-sm font-mulish first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br`}
              >
                {shelfToCopy[shelf]}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Float>
    </Menu>
  )
}

export { MenuButtonShape }
