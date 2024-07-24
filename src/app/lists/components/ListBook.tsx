"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { getSelectorsByUserAgent } from "react-device-detect"
import { Tooltip } from "react-tooltip"
import { FaHeart } from "react-icons/fa"
import { FaNoteSticky } from "react-icons/fa6"
import { GiOpenBook } from "react-icons/gi"
import { getBookLinkAgnostic } from "lib/helpers/general"
import { truncateString } from "lib/helpers/strings"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"
import CustomMarkdown from "app/components/CustomMarkdown"

const defaultWidths = "w-[72px] xs:w-[96px] sm:w-[144px]"
const favoriteBookWidths = "w-[72px] xs:w-[96px] sm:w-[144px] ml:w-[144px]"
const defaultHeights = "h-[116px] xs:h-[154px] sm:h-[216px]"
const favoriteBookHeights = "h-[116px] xs:h-[154px] sm:h-[216px] ml:h-[216px]"

export default function ListBook({
  book,
  note = undefined,
  isProfilePage = false,
  isRanked = false,
  rank = 0,
  widthClasses = "",
  heightClasses = "",
  detail = undefined,
  fade = false,
  showLikedByListCreator = false,
  listCreatorName = "",
}) {
  const [imgLoaded, setImgLoaded] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = navigator?.userAgent || ""
    const { isMobile: _isMobile } = getSelectorsByUserAgent(userAgent)
    setIsMobile(_isMobile)
  }, [])

  const imgRef = useRef(null)

  useEffect(() => {
    if ((imgRef.current as any)?.complete) setImgLoaded(true)
  }, [])

  const LinkOrDiv = isMobile ? "div" : Link

  const widthClassesToUse = widthClasses || (isProfilePage ? favoriteBookWidths : defaultWidths)
  const heightClassesToUse = heightClasses || (isProfilePage ? favoriteBookHeights : defaultHeights)

  const id = book.id || book.openLibraryWorkId

  return (
    <div key={id} className="flex flex-col items-center justify-center">
      <div className={`grow flex items-center ${widthClassesToUse} h-auto my-8 mx-auto sm:my-4`}>
        <div className="relative group">
          <LinkOrDiv
            // @ts-ignore this is a weird case, just let it be
            href={isMobile ? undefined : getBookLinkAgnostic(book)}
          >
            {book.coverImageUrl && !imgLoaded && (
              <CoverPlaceholder
                book={book}
                widthClasses={widthClassesToUse}
                heightClasses={heightClassesToUse}
                loading
              />
            )}
            {book.coverImageUrl ? (
              <img
                ref={imgRef}
                src={book.coverImageUrl}
                id={`book-${id}`}
                className={`w-full ${imgLoaded ? "block" : "hidden"} ${
                  fade ? "opacity-30" : ""
                } rounded-sm`}
                alt={`${book.title} cover`}
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <CoverPlaceholder
                widthClasses={widthClassesToUse}
                heightClasses={heightClassesToUse}
                book={book}
                fade={fade}
              />
            )}

            {showLikedByListCreator && book.likedByListCreator && (
              <div className="absolute -bottom-6 right-1 w-full flex justify-end">
                <FaHeart id={`liked-by-list-creator-${id}`} className="text-red-300" />
                <Tooltip
                  anchorSelect={`#liked-by-list-creator-${id}`}
                  className="z-10 max-w-[240px] font-mulish"
                >
                  {listCreatorName} loved it
                </Tooltip>
              </div>
            )}
          </LinkOrDiv>

          <BookCoverOverlay book={book} positionClass="bottom-1" />

          {note && <ListNote book={book} note={note} positionClass="-bottom-2 -right-3" />}
        </div>
      </div>

      <BookTooltip book={book} anchorSelect={`#book-${id}`} />

      {detail && <div className="-mt-2 text-gray-300 text-sm font-mulish">{detail}</div>}

      {isRanked && (
        <span className="flex justify-center w-1/2 border-b border-gray-700">{rank}</span>
      )}
    </div>
  )
}

const CoverPlaceholder = ({ book, loading = false, widthClasses, heightClasses, fade = false }) => {
  const id = book.id || book.openLibraryWorkId

  return (
    <div
      id={`book-${id}`}
      className={`${widthClasses} ${heightClasses} p-2 flex flex-col items-center justify-center border-2 ${
        fade ? "border-gray-800" : "border-gray-500"
      } box-border rounded font-mulish text-center text-sm ${
        fade ? "text-gray-700" : "text-gray-200"
      }`}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          <GiOpenBook
            className={`hidden sm:block mb-4 sm:mb-2 text-8xl sm:text-4xl ${
              fade ? "text-gray-800" : "text-gray-500"
            }`}
          />
          <div className="mb-2 sm:mb-0">{truncateString(book.title, 20)}</div>
          <div className="hidden sm:block">{truncateString(book.authorName, 20)}</div>
        </>
      )}
    </div>
  )
}

const ListNote = ({ book, note, positionClass }) => {
  const id = book.id || book.openLibraryWorkId

  const tooltipAnchorId = `book-${id}-featured-note`

  return (
    <div className={`absolute ${positionClass}`}>
      <FaNoteSticky id={tooltipAnchorId} className="text-gold-500 text-3xl" />
      <Tooltip
        anchorSelect={`#${tooltipAnchorId}`}
        openOnClick
        className="z-10 max-w-[360px] font-newsreader"
        opacity={1}
        style={{ backgroundColor: "hsl(45, 8%, 22%)" }} // bg-gray-900
        clickable
      >
        <div className="m-1 p-2">
          <div className="font-bold">{truncateString(`${book.title}`, 40)}</div>
          <div className="mb-2">{truncateString(`by ${book.authorName}`, 40)}</div>
          <CustomMarkdown markdown={note} />
          <Link href={getBookLinkAgnostic(book)} className="block mt-2 font-mulish underline">
            go to book page
          </Link>
        </div>
      </Tooltip>
    </div>
  )
}
