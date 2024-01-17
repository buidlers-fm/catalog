"use client"

import Link from "next/link"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { FaHeart, FaRegComment } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import UserProfile from "lib/models/UserProfile"
import { getBookLink, getNoteLink } from "lib/helpers/general"
import { dateTimeFormats } from "lib/constants/dateTime"
import ExpandableText from "app/components/ExpandableText"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookTooltip from "app/components/books/BookTooltip"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import EditBookNote from "app/components/bookNotes/EditBookNote"
import Likes from "app/components/Likes"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"
import InteractionObjectType from "enums/InteractionObjectType"

dayjs.extend(relativeTime)

const { longAmericanDate: timestampFormat } = dateTimeFormats

const TEXT_TRUNCATE_LENGTH = 500

export default function BookNoteCard({
  note,
  withCover = true,
  currentUserProfile,
  onEditSuccess,
  onDeleteSuccess,
}) {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const {
    id,
    creator: _creator,
    readingStatus,
    text,
    createdAt,
    book,
    likeCount,
    currentUserLike,
    creatorLikedBook,
    comments,
  } = note

  const creator = UserProfile.build(_creator)

  const isCreatedByCurrentUser = creator.id === currentUserProfile?.id

  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format(timestampFormat)

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
          <>
            <div id={`book-note-${id}`} className="w-16 mr-6 shrink-0">
              <Link href={getBookLink(book.slug)}>
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
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
        <div className="grow">
          <div className="flex flex-col xs:flex-row relative">
            <NameWithAvatar userProfile={creator} />

            <div className="xs:my-2 xs:ml-2 text-gray-500 text-sm font-mulish">
              {readingStatus && readingStatus !== BookNoteReadingStatus.None && (
                <span
                  className={`mr-2 inline-block mb-1 text-sm font-bold ${readingStatusColors[readingStatus]}`}
                >
                  {readingStatusCopy[readingStatus]}
                </span>
              )}
              <span id={`created-at-${id}`} className="mr-2">
                {createdAtFromNow}
              </span>
              {creatorLikedBook && (
                <>
                  <span className="mr-2">
                    <FaHeart
                      id={`book-note-creator-like-${id}`}
                      className="inline-block text-red-300 text-sm"
                    />
                  </span>

                  <Tooltip
                    anchorSelect={`#book-note-creator-like-${id}`}
                    className="max-w-[240px] font-mulish"
                  >
                    <div className="text-center">{creator.name} loved this book</div>
                  </Tooltip>
                </>
              )}
              {isCreatedByCurrentUser && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="absolute t-1 r-0">
                  <MdEdit className="text-lg text-gray-300" />
                </button>
              )}
            </div>
          </div>
          <Tooltip anchorSelect={`#created-at-${id}`} className="max-w-[240px] font-mulish">
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
          <div className="my-3 flex">
            <Likes
              interactive={!!currentUserProfile}
              likedObject={note}
              likedObjectType={InteractionObjectType.BookNote}
              likeCount={likeCount}
              currentUserLike={currentUserLike}
            />
            <div className="-mt-0.5 ml-4">
              <Link href={getNoteLink(id)} className="">
                <FaRegComment className="inline-block mr-1.5 text-gray-500 text-md" />
                {comments && <span className="text-sm text-gray-300">{comments.length}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
