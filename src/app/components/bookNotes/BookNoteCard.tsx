"use client"

import Link from "next/link"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { MdEdit } from "react-icons/md"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { getBookLink } from "lib/helpers/general"
import ExpandableText from "app/components/ExpandableText"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import EditBookNote from "app/components/bookNotes/EditBookNote"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"

dayjs.extend(relativeTime)

const TEXT_TRUNCATE_LENGTH = 500

export default function BookNoteCard({
  note,
  withCover = true,
  currentUserProfile,
  onEditSuccess,
  onDeleteSuccess,
}) {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const { creator, readingStatus, text, createdAt, book } = note

  const isCreatedByCurrentUser = creator.id === currentUserProfile?.id

  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format("MMMM D, YYYY")

  const readingStatusColors = {
    [BookNoteReadingStatus.Started]: "text-green-500",
    [BookNoteReadingStatus.Reading]: "text-teal-300",
    [BookNoteReadingStatus.Finished]: "text-gold-500",
    [BookNoteReadingStatus.Abandoned]: "text-gray-300",
  }

  const readingStatusCopy = {
    [BookNoteReadingStatus.Started]: "started",
    [BookNoteReadingStatus.Reading]: "still reading",
    [BookNoteReadingStatus.Finished]: "finished",
    [BookNoteReadingStatus.Abandoned]: "abandoned",
  }

  function handleEditSuccess() {
    setIsEditing(false)
    onEditSuccess()
  }

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        {withCover && (
          <div className="w-16 mr-6 shrink-0">
            <Link href={getBookLink(book.slug)}>
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt="cover"
                  className="w-full mx-auto shadow-md rounded-xs"
                />
              ) : (
                <CoverPlaceholder />
              )}
            </Link>
          </div>
        )}
        <div className="grow">
          <div className="flex flex-col xs:flex-row">
            <NameWithAvatar userProfile={creator} />

            <div className="xs:my-2 xs:ml-2 text-gray-500 text-sm font-mulish">
              <span
                className={`mr-2 inline-block mb-1 text-sm font-bold ${readingStatusColors[readingStatus]}`}
              >
                {readingStatusCopy[readingStatus]}
              </span>
              <span id="created-at" className="mr-2">
                {createdAtFromNow}
              </span>
              {isCreatedByCurrentUser && !isEditing && (
                <button onClick={() => setIsEditing(true)}>
                  <MdEdit className="-mt-2 text-lg text-gray-300" />
                </button>
              )}
            </div>
          </div>
          <Tooltip anchorSelect="#created-at" className="max-w-[240px] font-mulish">
            <div className="text-center">{createdAtFormatted}</div>
          </Tooltip>
          {isEditing ? (
            <EditBookNote
              bookNote={note}
              onEditSuccess={handleEditSuccess}
              onDeleteSuccess={onDeleteSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="mt-1 mb-2 font-newsreader">
              <ExpandableText text={text} maxChars={TEXT_TRUNCATE_LENGTH} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
