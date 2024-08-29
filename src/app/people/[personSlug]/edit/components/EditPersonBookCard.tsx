import Link from "next/link"
import { getBookLinkAgnostic, getBookEditLinkAgnostic } from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"

export default function BookCard({ book, addBook, isEditing }) {
  const { id, openLibraryWorkId, coverImageUrl, title, editionsCount, firstPublishedYear } = book

  const idForAnchor = id || openLibraryWorkId

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        <div id={`book-${idForAnchor}`} className="w-16 mr-6 shrink-0">
          <div className="relative group">
            <Link href={getBookLinkAgnostic(book)}>
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="cover"
                  className="w-full mx-auto shadow-md rounded-xs"
                />
              ) : (
                <CoverPlaceholder size="sm" />
              )}
            </Link>

            <BookCoverOverlay book={book} positionClass="bottom-1" />
          </div>
        </div>

        <BookTooltip book={book} anchorSelect={`#book-${idForAnchor}`} />

        <div className="grow">
          <Link href={getBookLinkAgnostic(book)}>{title}</Link>
          <div className="text-gray-300">
            {editionsCount} editions • {firstPublishedYear}
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center">
            <button className="cat-btn cat-btn-sm cat-btn-gold" onClick={() => addBook(book)}>
              +
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <Link
              href={getBookEditLinkAgnostic(book)}
              target="_blank"
              className="underline text-sm text-gray-300"
            >
              edit book
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
