import Link from "next/link"
import { GiOpenBook } from "react-icons/gi"
import { truncateString } from "lib/helpers/general"

const NUM_BOOK_COVERS = 4

export default function ListCard({ list, separators = true, compact = false }) {
  const totalBookCount = list.books.length
  const books = list.books.slice(0, NUM_BOOK_COVERS)

  return (
    <div
      className={`${compact ? null : "py-6"} ${
        separators && "border-b border-b-gray-500 last:border-none"
      }`}
    >
      <Link href={list.url}>
        <div className="sm:flex items-center">
          <div className="w-[208px] flex shrink-0 mr-4">
            {books.map((book, idx) => (
              <ListCardBook key={book.id} book={book} idx={idx} />
            ))}
          </div>
          <div className="mt-4 sm:mt-2 sm:mx-4 grow">
            <div className="mt-[-8px]">
              <span className="font-bold">{truncateString(list.title, 64)}</span>
              <span className="ml-2 text-gray-500 text-sm font-normal">{totalBookCount} books</span>
            </div>
            {list.description && <div>{truncateString(list.description, 100)}</div>}
          </div>
        </div>
      </Link>
    </div>
  )
}

function ListCardBook({ book, idx }) {
  const zIndexes = ["z-40", "z-30", "z-20", "z-10"]
  const zIndex = zIndexes[idx]

  return (
    <div className={`-mr-[16px] w-[64px] h-[96px] overflow-hidden ${zIndex}`}>
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          className="h-full object-cover rounded-sm"
          alt={`${book.title} cover`}
        />
      ) : (
        <div className="w-full h-full shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
          <GiOpenBook className="mt-0 text-2xl text-gray-500" />
        </div>
      )}
    </div>
  )
}