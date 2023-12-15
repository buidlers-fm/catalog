import Link from "next/link"
import { useRouter } from "next/navigation"
import { isMobile } from "react-device-detect"
import { getBookLink } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookTooltip from "app/components/books/BookTooltip"

export default function CurrentStatus({ userProfile, userCurrentStatus, isUsersProfile }) {
  const router = useRouter()

  const { name } = userProfile
  const { text, book } = userCurrentStatus || {}

  return userCurrentStatus ? (
    <div className="flex flex-row lg:flex-col">
      {book && (
        <>
          <div
            id="current-status-book"
            className="shrink-0 w-[72px] xs:w-[96px] ml-4 mr-6 my-4 lg:w-2/3 lg:mx-auto lg:mt-6"
          >
            <button onClick={() => router.push(getBookLink(book.slug))} disabled={isMobile}>
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt="cover"
                  className="object-top mx-auto shadow-md rounded-sm"
                />
              ) : (
                <CoverPlaceholder
                  book={book}
                  sizeClasses="w-[72px] h-[108px] xs:w-[96px] xs:h-[144px] lg:w-[144px] lg:h-[216px]"
                />
              )}
            </button>
          </div>
          <BookTooltip book={book} anchorSelect="#current-status-book" />
        </>
      )}
      {text && (
        <div className="grow">
          <div className="mt-4 mb-2 lg:my-2 font-newsreader">{text}</div>
          <div className="my-2 px-6 text-right text-sm">— {name}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="py-8 px-4 flex items-center justify-center font-newsreader italic text-gray-300">
      {isUsersProfile ? "What's on your mind?" : `${name}'s current status is a mystery.`}
    </div>
  )
}
