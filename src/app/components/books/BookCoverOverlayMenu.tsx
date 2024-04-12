"use client"

import Link from "next/link"
import { Menu } from "@headlessui/react"
import { Float } from "@headlessui-float/react"
import { BsThreeDots } from "react-icons/bs"
import { useModals } from "lib/contexts/ModalsContext"
import { getBookLinkAgnostic } from "lib/helpers/general"
import CurrentModal from "enums/CurrentModal"
import type Book from "types/Book"

type Props = {
  book: Book
}

export default function BookCoverOverlayMenu({ book }: Props) {
  const { setCurrentBook, setCurrentModal } = useModals()

  const { title, authorName } = book

  function handleAddBookToLists() {
    setCurrentBook(book)
    setCurrentModal(CurrentModal.AddBookToLists)
  }

  return (
    <Menu>
      <Float placement="right" offset={10} flip>
        <Menu.Button className="flex items-center cat-btn-text text-sm">
          <BsThreeDots className="text-gray-500 text-lg" />
        </Menu.Button>
        <Menu.Items className="w-[240px] bg-gray-900 rounded font-mulish text-sm">
          <div className="px-4 py-2">
            {title} by {authorName}
          </div>

          <hr className="my-1" />

          <Menu.Item>
            <button
              onClick={handleAddBookToLists}
              className="w-full hover:bg-gray-700 px-4 py-2.5 text-left first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br"
            >
              add book to list(s)
            </button>
          </Menu.Item>

          <Menu.Item>
            <Link href={getBookLinkAgnostic(book)}>
              <button className="w-full hover:bg-gray-700 px-4 py-2.5 text-left first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br">
                go to book page
              </button>
            </Link>
          </Menu.Item>
        </Menu.Items>
      </Float>
    </Menu>
  )
}
