"use client"

import { Tooltip } from "react-tooltip"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"

dayjs.extend(relativeTime)

export default function BookNoteCard({ note, withCover = true }) {
  const { creator, readingStatus, text, createdAt, book } = note
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
    [BookNoteReadingStatus.Reading]: "is still reading",
    [BookNoteReadingStatus.Finished]: "finished",
    [BookNoteReadingStatus.Abandoned]: "abandoned",
  }

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        {withCover && (
          <div className="w-16 mr-6">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt="cover"
                className="w-full mx-auto shadow-md rounded-xs"
              />
            ) : (
              <CoverPlaceholder />
            )}
          </div>
        )}
        <div className="">
          <div className="flex flex-col xs:flex-row">
            <NameWithAvatar userProfile={creator} />

            <div className="xs:my-2 xs:ml-2 text-gray-500 text-sm font-mulish">
              <span className={`mr-2 text-sm font-bold ${readingStatusColors[readingStatus]}`}>
                {readingStatusCopy[readingStatus]}
              </span>
              <span id="created-at">{createdAtFromNow}</span>
            </div>
          </div>
          <Tooltip anchorSelect="#created-at" className="max-w-[240px] font-mulish">
            <div className="text-center">{createdAtFormatted}</div>
          </Tooltip>
          <div className="mt-1 mb-2 font-newsreader">{text}</div>
        </div>
      </div>
    </div>
  )
}
