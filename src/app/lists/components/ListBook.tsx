"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { GiOpenBook } from "react-icons/gi"
import { Tooltip } from "react-tooltip"
import { getBookLink, truncateString } from "lib/helpers/general"

const { isMobile }: any = dynamic(() => import("react-device-detect") as any, { ssr: false })

const convertImageUrlToLarge = (imageUrl) => {
  const pattern = /-M(\.\w+)$/ // filename ends in "-M", followed by file extension
  const match = imageUrl.match(pattern)

  if (!match) return imageUrl

  const fileExtension = match[1]
  const largeImageUrl = imageUrl.replace(pattern, `-L${fileExtension}`)

  return largeImageUrl
}

const defaultWidths = "w-[72px] xs:w-[96px] sm:w-[144px]"
const favoriteBookWidths = "w-[72px] xs:w-[96px] sm:w-[144px] ml:w-[180px]"
const defaultHeights = "h-[116px] xs:h-[154px] sm:h-[216px]"
const favoriteBookHeights = "h-[116px] xs:h-[154px] sm:h-[216px]"

export default function ListBook({ book, isFavorite = false }) {
  const router = useRouter()

  const [imgLoaded, setImgLoaded] = useState<boolean>(false)

  const imgRef = useRef(null)

  useEffect(() => {
    if ((imgRef.current as any)?.complete) setImgLoaded(true)
  }, [])

  return (
    <div
      key={book.id}
      className={`${
        isFavorite ? favoriteBookWidths : defaultWidths
      } h-auto my-8 mx-auto sm:my-4 flex items-center justify-center`}
    >
      <div className="w-full">
        <button onClick={() => router.push(getBookLink(book.slug))} disabled={isMobile}>
          <div>
            {book.coverImageUrl && !imgLoaded && (
              <CoverPlaceholder book={book} isFavorite={isFavorite} loading />
            )}
            {book.coverImageUrl ? (
              <img
                ref={imgRef}
                src={convertImageUrlToLarge(book.coverImageUrl) as any}
                id={`book-${book.id}`}
                className={`w-full ${imgLoaded ? "block" : "hidden"}`}
                alt={`${book.title} cover`}
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <CoverPlaceholder isFavorite={isFavorite} book={book} />
            )}
          </div>
        </button>
      </div>
      <Tooltip
        anchorSelect={`#book-${book.id}`}
        className="max-w-[240px] font-mulish"
        clickable={isMobile}
      >
        <button onClick={() => router.push(getBookLink(book.slug))} disabled={!isMobile}>
          <div className="text-center">{truncateString(`${book.title}`, 40)}</div>
          <div className="text-center">{truncateString(`by ${book.authorName}`, 40)}</div>
          {isMobile && <div className="underline">Go to page</div>}
        </button>
      </Tooltip>
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
