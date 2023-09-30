"use client"

import Link from "next/link"
import { GiOpenBook } from "react-icons/gi"
import { Tooltip } from "react-tooltip"
import { getBookLink, truncateString } from "lib/helpers/general"

const convertImageUrlToLarge = (imageUrl) => {
  const pattern = /-M(\.\w+)$/ // filename ends in "-M", followed by file extension
  const match = imageUrl.match(pattern)

  if (!match) return imageUrl

  const fileExtension = match[1]
  const largeImageUrl = imageUrl.replace(pattern, `-L${fileExtension}`)

  return largeImageUrl
}

export default function ListBook({ book }) {
  return (
    <div
      key={book.id}
      className="w-[288px] sm:w-[144px] h-auto my-8 mx-auto sm:my-4 flex items-center justify-center"
    >
      <Link href={getBookLink(book.slug)}>
        {book.coverImageUrl ? (
          <img
            src={convertImageUrlToLarge(book.coverImageUrl) as any}
            id={`book-${book.id}`}
            className="w-full"
            alt={`${book.title} cover`}
          />
        ) : (
          <div
            id={`book-${book.id}`}
            className="w-[288px] h-[432px] sm:w-[144px] sm:h-[216px] p-2 flex flex-col items-center justify-center border-2 border-gray-500 box-border rounded font-nunito-sans text-center text-xl sm:text-sm text-gray-200"
          >
            <GiOpenBook className="mb-4 sm:mb-2 text-8xl sm:text-4xl text-gray-500" />
            <div className="mb-2 sm:mb-0">{truncateString(book.title, 20)}</div>
            <div>{truncateString(book.authorName, 20)}</div>
          </div>
        )}
      </Link>
      <Tooltip anchorSelect={`#book-${book.id}`} className="max-w-[240px] font-nunito-sans">
        <div className="text-center">{truncateString(`${book.title}`, 40)}</div>
        <div className="text-center">{truncateString(`by ${book.authorName}`, 40)}</div>
      </Tooltip>
    </div>
  )
}
