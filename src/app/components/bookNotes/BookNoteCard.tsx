"use client"

import { Tooltip } from "react-tooltip"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { GiOpenBook } from "react-icons/gi"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"

dayjs.extend(relativeTime)

export default function BookNoteCard({ note, withCover = true }) {
  const { creator, text, createdAt, book } = note
  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format("MMMM D, YYYY")

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

const CoverPlaceholder = () => (
  <div className="w-[256px] h-[410px] shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded font-mulish text-center">
    <GiOpenBook className="mt-0 text-9xl text-gray-500" />
  </div>
)
