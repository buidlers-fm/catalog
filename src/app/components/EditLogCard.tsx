"use client"

import Link from "next/link"
import { getBookLink } from "lib/helpers/general"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import UserProfile from "lib/models/UserProfile"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookTooltip from "app/components/books/BookTooltip"
import EditType from "enums/EditType"

function camelCaseToWords(str) {
  return str.replace(/([A-Z])/g, " $1").toLowerCase()
}

export default function EditLogCard({ editLog, withCover = true }) {
  const { id, editor, book, editType, editedFields, createdAt } = editLog

  const { name } = UserProfile.build(editor)

  const timestampTooltipAnchorId = `edited-at-${id}`

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  const coverImageUrl = book.coverImageThumbnailUrl || book.coverImageUrl

  const isCoverEdit = editType === EditType.Cover

  return (
    <div className="flex items-center px-4 py-4 border-b border-b-gray-800 last:border-none">
      {withCover && (
        <>
          <div id={`book-note-${id}`} className="w-16 mr-6 shrink-0">
            <Link href={getBookLink(book.slug)}>
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
          </div>
          <BookTooltip book={book} anchorSelect={`#book-note-${id}`} />
        </>
      )}
      <div className="">
        {name} edited {isCoverEdit ? "the cover of " : ""}
        <Link href={getBookLink(book.slug)} className="cat-link">
          {book.title}
        </Link>
        .
        <span id={timestampTooltipAnchorId} className="ml-2 mt-2 text-sm text-gray-500">
          {createdAtFromNow}
        </span>
        {timestampTooltip}
        {!isCoverEdit && (
          <div className="ml-2 mt-1 text-sm text-gray-500">
            ({editedFields.map((fieldName) => camelCaseToWords(fieldName)).join(", ")})
          </div>
        )}
      </div>
    </div>
  )
}
