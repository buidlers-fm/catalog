"use client"

import { GiOpenBook } from "react-icons/gi"
import { BsXLg } from "react-icons/bs"
import Search from "app/components/nav/Search"
import { truncateString } from "lib/helpers/general"
import type Book from "types/Book"

type Props = {
  books: Book[]
  onBookSelect: (book: Book) => void
  onBookRemove: (book: Book) => void
}

export default function EditBookList({ books, onBookSelect, onBookRemove }: Props) {
  return (
    <>
      <div className="mt-8 mb-4 text-xl">Add books</div>
      <Search isNav={false} onSelect={onBookSelect} />
      <div className="mt-6 mb-2">
        {books.length > 0 ? (
          <ul>
            {books.map((book) => (
              <BookRow key={book.openlibraryBookId} book={book} onRemove={onBookRemove} />
            ))}
          </ul>
        ) : (
          <div className="h-32 flex items-center justify-center border border-gray-700 rounded">
            Add some books using the above search field.
          </div>
        )}
      </div>
    </>
  )
}

function BookRow({ book, onRemove }) {
  return (
    <li className="flex items-center -my-[1px] px-2 py-3 border border-gray-700 first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br">
      <div className="w-[76px] h-[76px] flex items-center justify-center">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            className="w-auto h-[72px] shrink-0 rounded-sm"
            alt={`${book.title} cover`}
          />
        ) : (
          <div className="w-12 h-[72px] shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
            <GiOpenBook className="mt-0 text-4xl text-gray-500" />
          </div>
        )}
      </div>
      <div className="mx-4 grow">
        <div className="mt-[-8px] font-bold">{truncateString(book.title, 64)}</div>
        <div>{truncateString(book.by, 32)}</div>
      </div>
      <div className="">
        <button onClick={() => onRemove(book)} className="p-2">
          <BsXLg className="text-xl text-gray-200" />
        </button>
      </div>
    </li>
  )
}
