"use client"

import Link from "next/link"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { FaRegComment } from "react-icons/fa"
import { TbExternalLink } from "react-icons/tb"
import { MdEdit } from "react-icons/md"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { getBookLink, getPostLink, getDomainFromUrl } from "lib/helpers/general"
import { dateTimeFormats } from "lib/constants/dateTime"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookTooltip from "app/components/books/BookTooltip"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import EditBookLinkPost from "app/components/bookPosts/EditBookLinkPost"
import Likes from "app/components/Likes"
import InteractionObjectType from "enums/InteractionObjectType"

dayjs.extend(relativeTime)

const { longAmericanDate: timestampFormat } = dateTimeFormats

export default function BookLinkPostCard({
  post,
  withCover = true,
  currentUserProfile,
  onEditSuccess,
  onDeleteSuccess,
}) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const {
    id,
    creator,
    title,
    linkUrl,
    createdAt,
    book,
    likeCount,
    currentUserLike,
    comments,
    commentCount,
  } = post

  const isCreatedByCurrentUser = creator.id === currentUserProfile?.id

  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format(timestampFormat)

  function handleEditSuccess() {
    setIsEditing(false)
    onEditSuccess()
  }

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        {withCover && (
          <>
            <div id={`book-link-${id}`} className="w-16 mr-6 shrink-0">
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
            <BookTooltip book={book} anchorSelect={`#book-link-${id}`} />
          </>
        )}
        <div className="grow">
          {isEditing ? (
            <EditBookLinkPost
              bookPost={post}
              onEditSuccess={handleEditSuccess}
              onDeleteSuccess={onDeleteSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div>
              <TbExternalLink className="inline-block -mt-1 mr-1 text-lg text-gray-300" />
              <Link
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-2 text-lg font-newsreader"
              >
                {title}
              </Link>
              <span className="text-sm text-gray-300 font-mulish">
                ({getDomainFromUrl(linkUrl)})
              </span>
            </div>
          )}
          <div className="flex flex-col xs:flex-row">
            <div className="xs:my-2 mr-2 text-sm font-mulish">posted by</div>
            <NameWithAvatar userProfile={creator} />

            <div className="xs:my-2 xs:ml-2 text-gray-500 text-sm font-mulish">
              <span id={`created-at-${id}`} className="mr-2">
                {createdAtFromNow}
              </span>
              {isCreatedByCurrentUser && !isEditing && (
                <button onClick={() => setIsEditing(true)}>
                  <MdEdit className="-mt-2 text-lg text-gray-300" />
                </button>
              )}
            </div>
          </div>
          <Tooltip anchorSelect={`#created-at-${id}`} className="max-w-[240px] font-mulish">
            <div className="text-center">{createdAtFormatted}</div>
          </Tooltip>
          <div className="my-3 flex">
            <Likes
              interactive={!!currentUserProfile}
              likedObject={post}
              likedObjectType={InteractionObjectType.BookNote}
              likeCount={likeCount}
              currentUserLike={currentUserLike}
            />
            <div className="-mt-0.5 ml-4">
              <Link href={getPostLink(id)} className="">
                <FaRegComment className="inline-block mr-1.5 text-gray-500 text-md" />
                {comments && (
                  <span className="text-sm text-gray-300">{commentCount || comments.length}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
