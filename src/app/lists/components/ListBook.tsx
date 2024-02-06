"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { GiOpenBook } from "react-icons/gi"
import { getBookLink } from "lib/helpers/general"
import { truncateString } from "lib/helpers/strings"
import BookTooltip from "app/components/books/BookTooltip"

const { isMobile }: any = dynamic(() => import("react-device-detect") as any, { ssr: false })

const defaultWidths = "w-[72px] xs:w-[96px] sm:w-[144px]"
const favoriteBookWidths = "w-[72px] xs:w-[96px] sm:w-[144px] ml:w-[144px]"
const defaultHeights = "h-[116px] xs:h-[154px] sm:h-[216px]"
const favoriteBookHeights = "h-[116px] xs:h-[154px] sm:h-[216px] ml:h-[216px]"

export default function ListBook({ book, isFavorite = false, isRanked = false, rank = 0 }) {
  const [imgLoaded, setImgLoaded] = useState<boolean>(false)

  const imgRef = useRef(null)

  useEffect(() => {
    if ((imgRef.current as any)?.complete) setImgLoaded(true)
  }, [])

  const LinkOrDiv = isMobile ? "div" : Link

  return (
    <div key={book.id} className="flex flex-col items-center justify-center">
      <LinkOrDiv
        // @ts-ignore this is a weird case, just let it be
        href={isMobile ? undefined : getBookLink(book.slug)}
        className="grow flex items-center"
      >
        <button
          className={`${
            isFavorite ? favoriteBookWidths : defaultWidths
          } h-auto my-8 mx-auto sm:my-4`}
          disabled={isMobile}
        >
          <div>
            {book.coverImageUrl && !imgLoaded && (
              <CoverPlaceholder book={book} isFavorite={isFavorite} loading />
            )}
            {book.coverImageUrl ? (
              <img
                ref={imgRef}
                src={book.coverImageUrl}
                id={`book-${book.id}`}
                className={`w-full ${imgLoaded ? "block" : "hidden"} rounded-sm`}
                alt={`${book.title} cover`}
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <CoverPlaceholder isFavorite={isFavorite} book={book} />
            )}
          </div>
        </button>
      </LinkOrDiv>
      <BookTooltip book={book} anchorSelect={`#book-${book.id}`} />
      {isRanked && (
        <span className="flex justify-center w-1/2 border-b border-gray-700">{rank}</span>
      )}
    </div>
  )
}

const CoverPlaceholder = ({ book, loading = false, isFavorite = false }) => (
  <div
    id={`book-${book.id}`}
    className={`${
      isFavorite
        ? `${favoriteBookWidths} ${favoriteBookHeights}`
        : `${defaultWidths} ${defaultHeights}`
    } p-2 flex flex-col items-center justify-center border-2 border-gray-500 box-border rounded font-mulish text-center text-sm text-gray-200`}
  >
    {loading ? (
      "Loading..."
    ) : (
      <>
        <GiOpenBook className="hidden sm:block mb-4 sm:mb-2 text-8xl sm:text-4xl text-gray-500" />
        <div className="mb-2 sm:mb-0">{truncateString(book.title, 20)}</div>
        <div>{truncateString(book.authorName, 20)}</div>
      </>
    )}
  </div>
)
