"use client"

import Link from "next/link"
import { getBookLink, getPersonLinkWithSlug } from "lib/helpers/general"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import UserProfile from "lib/models/UserProfile"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookTooltip from "app/components/books/BookTooltip"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"

function camelCaseToWords(str) {
  return str.replace(/([A-Z])/g, " $1").toLowerCase()
}

export default function EditLogCard({ editLog, withCover = true }) {
  const { editedObjectType } = editLog

  if (editedObjectType === EditedObjectType.Book) {
    return <EditLogCardBook editLog={editLog} withCover={withCover} />
  } else if (editedObjectType === EditedObjectType.Person) {
    return <EditLogCardPerson editLog={editLog} />
  }
}

function EditLogCardBook({ editLog, withCover = true }) {
  const { id, editor, editedObject: book, editType, editedFields, createdAt } = editLog

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
  const isAdaptationEdit = editType.match(/adaptation/)

  let editTypeText = `${name} edited `
  if (isCoverEdit) {
    editTypeText = `${name} changed the cover of `
  } else if (editType === EditType.AdaptationCreate) {
    editTypeText = `${name} added an adaptation to `
  } else if (editType === EditType.AdaptationUpdate) {
    editTypeText = `${name} edited an adaptation of `
  } else if (editType === EditType.AdaptationDelete) {
    editTypeText = `${name} removed an adaptation from `
  }

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
        {editTypeText}
        <Link href={getBookLink(book.slug)} className="cat-link">
          {book.title}
        </Link>
        .
        <span id={timestampTooltipAnchorId} className="ml-2 mt-2 text-sm text-gray-500">
          {createdAtFromNow}
        </span>
        {timestampTooltip}
        {!isCoverEdit && !isAdaptationEdit && (
          <div className="ml-2 mt-1 text-sm text-gray-500">
            ({editedFields.map((fieldName) => camelCaseToWords(fieldName)).join(", ")})
          </div>
        )}
      </div>
    </div>
  )
}

function EditLogCardPerson({ editLog }) {
  const { id, editor, editedObject: person, editedFields, createdAt } = editLog

  const { name: editorName } = UserProfile.build(editor)

  const timestampTooltipAnchorId = `edited-at-${id}`

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  const { name, imageUrl, slug } = person

  return (
    <div className="flex items-center px-4 py-4 border-b border-b-gray-800 last:border-none">
      <img src={imageUrl} alt={name} className="w-16 h-16 mr-6 shrink-0 rounded-full" />
      <div className="">
        {editorName} edited{" "}
        <Link href={getPersonLinkWithSlug(slug)} className="cat-link">
          {name}
        </Link>
        &rsquo;s page.
        <span id={timestampTooltipAnchorId} className="ml-2 mt-2 text-sm text-gray-500">
          {createdAtFromNow}
        </span>
        {timestampTooltip}
        <div className="ml-2 mt-1 text-sm text-gray-500">
          ({editedFields.map((fieldName) => camelCaseToWords(fieldName)).join(", ")})
        </div>
      </div>
    </div>
  )
}
