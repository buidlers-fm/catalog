"use client"

import { useState, useEffect } from "react"
import { Menu } from "@headlessui/react"
import { FaBookmark, FaRegBookmark } from "react-icons/fa"
import toast from "react-hot-toast"
import api from "lib/api"
import UserBookShelf from "enums/UserBookShelf"

const SHELVES = Object.values(UserBookShelf)

const shelfToCopy = {
  [UserBookShelf.ToRead]: {
    buttonCopy: "to read",
  },
  [UserBookShelf.UpNext]: {
    buttonCopy: "up next",
  },
  [UserBookShelf.CurrentlyReading]: {
    buttonCopy: "currently reading",
  },
  [UserBookShelf.Read]: {
    buttonCopy: "read",
  },
  [UserBookShelf.Abandoned]: {
    buttonCopy: "abandoned",
  },
}

export default function UserBookShelfMenu({ book, currentUserShelf, onChange }) {
  const [selectedShelf, setSelectedShelf] = useState<UserBookShelf>(currentUserShelf)

  useEffect(() => {
    setSelectedShelf(currentUserShelf)
  }, [currentUserShelf])

  function isCurrentShelf(shelf) {
    return selectedShelf === shelf
  }

  async function handleSelectShelf(shelf) {
    if (isCurrentShelf(shelf)) return

    // optimistic update
    try {
      const originalSelectedShelf = selectedShelf
      setSelectedShelf(shelf)

      try {
        await api.userBookShelves.set({
          book,
          shelf,
        })

        if (onChange) await onChange(shelf)
      } catch (error: any) {
        setSelectedShelf(originalSelectedShelf)
        throw error
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Hmm, something went wrong.")
    }
  }

  return (
    <Menu>
      <Menu.Button className="cat-btn-text text-sm">
        {selectedShelf ? (
          <div className="mt-[1px] flex items-center">
            <FaBookmark className="text-gold-500 text-sm" />
            <div className="ml-1.5">{shelfToCopy[selectedShelf].buttonCopy}</div>
          </div>
        ) : (
          <div className="mt-[1px] flex items-center text-gray-300">
            <FaRegBookmark className="text-gray-300 text-sm" />
            <div className="ml-1.5">shelves</div>
          </div>
        )}
      </Menu.Button>
      <div className="relative">
        <Menu.Items className="absolute top-2 w-[144px] bg-gray-900 rounded">
          {SHELVES.map((shelf) => (
            <Menu.Item key={shelf}>
              <button
                onClick={() => handleSelectShelf(shelf)}
                disabled={isCurrentShelf(shelf)}
                className={`w-full hover:bg-gray-700 px-4 py-3 ${
                  isCurrentShelf(shelf) ? "text-gold-500" : "text-white"
                } text-left text-sm font-mulish first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br`}
              >
                {shelfToCopy[shelf].buttonCopy}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </div>
    </Menu>
  )
}
