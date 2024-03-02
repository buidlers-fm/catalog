import Link from "next/link"
import { getBookLink } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import CustomMarkdown from "app/components/CustomMarkdown"

export default function ListBookCard({ book, note, isRanked = false, rank = 0 }) {
  const { title, authorName, slug, coverImageUrl } = book

  return (
    <div className="flex py-6 border-b border-b-gray-500 last:border-none font-newsreader">
      <div className="relative group shrink-0 w-[72px] xs:w-[96px] ml-4 mr-6">
        <Link href={getBookLink(slug)}>
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="cover"
              className="object-top mx-auto shadow-md rounded-sm"
            />
          ) : (
            <CoverPlaceholder
              book={book}
              sizeClasses="w-[72px] h-[108px] xs:w-[96px] xs:h-[144px]"
            />
          )}
        </Link>

        <BookCoverOverlay book={book} positionClass="bottom-1" />
      </div>
      <div className="grow">
        <div className="text-2xl font-semibold">
          {isRanked && <span className="mr-2">{rank}.</span>}
          {title}
        </div>
        <div className="text-gray-300 text-lg">by {authorName}</div>
        {note && (
          <div className="my-2">
            <CustomMarkdown markdown={note} />
          </div>
        )}
      </div>
    </div>
  )
}
