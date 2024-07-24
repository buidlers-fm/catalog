"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useCallback } from "react"
import { Tooltip } from "react-tooltip"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FaRegComment } from "react-icons/fa"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import GridCardViewToggle from "app/lists/components/GridCardViewToggle"
import ListBook from "app/lists/components/ListBook"
import ListBookCard from "app/lists/components/ListBookCard"
import Likes from "app/components/Likes"
import CustomMarkdown from "app/components/CustomMarkdown"
import EditComment from "app/components/comments/EditComment"
import CommentCard from "app/components/comments/CommentCard"
import Toggle from "app/components/Toggle"
import { getUserProfileLink, getEditListLink } from "lib/helpers/general"
import { dateTimeFormats } from "lib/constants/dateTime"
import UserProfile from "lib/models/UserProfile"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
import SaveBookmark from "app/components/saves/SaveBookmark"
import type { UserProfileProps } from "lib/models/UserProfile"
import type List from "types/List"

dayjs.extend(relativeTime)

const { longAmericanDate: timestampFormat } = dateTimeFormats

type ViewType = "grid" | "card"

export default function UserList({
  userProfile,
  list,
  isUsersList,
  currentUserProfile,
  currentUserReadList,
  view = "grid",
}: {
  userProfile: UserProfileProps
  list: List
  isUsersList: boolean
  currentUserProfile?: UserProfileProps
  currentUserReadList: List
  view?: ViewType
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [activeView, setActiveView] = useState<ViewType>(view)
  const [fadeRead, setFadeRead] = useState(false)
  const [comments, setComments] = useState<any[]>(list.comments || [])

  const {
    id: listId,
    title,
    slug: listSlug,
    description,
    createdAt,
    ranked,
    updatedAt: _updatedAt,
    likeCount,
    currentUserLike,
    save,
  } = list
  const { name, username } = UserProfile.build(userProfile)
  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format(timestampFormat)
  const updatedAt = _updatedAt || createdAt
  const updatedAtFromNow = dayjs(updatedAt).fromNow()
  const updatedAtFormatted = dayjs(updatedAt).format(timestampFormat)

  const hasNotes = list.listItemAssignments.some((lta) => lta.note)

  const bookIdsToNotes = list.listItemAssignments.reduce((obj, lta) => {
    obj[lta.listedObjectId] = lta.note
    return obj
  }, {})

  const getComments = useCallback(async () => {
    const requestData = {
      parentType: CommentParentType.List,
      parentId: listId,
    }

    try {
      const _comments = await api.comments.get(requestData)

      setComments(_comments)
    } catch (error: any) {
      reportToSentry(error, requestData)
    }
  }, [listId])

  function handleViewChange(_view: ViewType) {
    router.push(`${pathname}?view=${_view}`, { scroll: false })
    setActiveView(_view)
  }

  const replyAnchorId = "reply"

  const booksCurrentUserHasRead = currentUserReadList.books!.filter((book) =>
    list.books!.some((listBook) => listBook.id === book.id),
  )

  const hasCurrentUserReadBook = (book) => booksCurrentUserHasRead.some((b) => b.id === book.id)

  const booksReadCount = booksCurrentUserHasRead.length
  const booksTotalCount = list.books!.length
  const booksReadPercentage = Math.round((booksReadCount / booksTotalCount) * 100)

  return (
    <div className="mt-4 xs:w-[400px] sm:w-[600px] ml:w-[832px] mx-8 xs:mx-auto">
      <div className="sm:flex sm:items-start">
        <div className="text-4xl font-semibold mb-1 sm:mr-6">{title}</div>
        {isUsersList && (
          <Link href={getEditListLink(userProfile, listSlug!)}>
            <button className="cat-btn cat-btn-sm cat-btn-gray my-2 sm:my-0">edit</button>
          </Link>
        )}
      </div>
      <div className="my-1 text-gray-200 font-mulish">
        a list by{" "}
        <Link href={getUserProfileLink(username)} className="cat-underline">
          {name}
        </Link>
      </div>
      <div className="mt-1 mb-2 text-gray-500 text-sm font-mulish">
        created <span id="created-at">{createdAtFromNow}</span>, last updated{" "}
        <span id="updated-at">{updatedAtFromNow}</span>
      </div>
      <Tooltip anchorSelect="#created-at" className="max-w-[240px] font-mulish">
        <div className="text-center">{createdAtFormatted}</div>
      </Tooltip>
      <Tooltip anchorSelect="#updated-at" className="max-w-[240px] font-mulish">
        <div className="text-center">{updatedAtFormatted}</div>
      </Tooltip>
      <div className="flex items-center my-2">
        <Likes
          interactive={!!currentUserProfile}
          likedObject={list}
          likedObjectType={InteractionObjectType.List}
          likeCount={likeCount}
          currentUserLike={currentUserLike}
        />

        <div className="ml-4">
          <div className="flex items-center font-mulish text-sm text-gray-300">
            <Link href="#comments" className="flex items-center">
              <FaRegComment className="mr-1.5 text-gray-500 text-md" />
              {comments && (
                <span className="text-sm text-gray-300 font-mulish">{comments.length}</span>
              )}
            </Link>
            <a href={`#${replyAnchorId}`} className="ml-4 border-b border-b-gray-300">
              reply
            </a>
          </div>
        </div>

        {currentUserProfile && listId && (
          <div className="ml-4">
            <SaveBookmark
              savedObjectType={InteractionObjectType.List}
              savedObjectId={listId}
              saveId={save?.id}
            />
          </div>
        )}
      </div>
      <div className="my-4">
        <CustomMarkdown markdown={description} />
      </div>

      {currentUserProfile && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mt-8 mb-4 max-w-md border border-gray-800 rounded font-mulish">
            <div className="flex justify-between items-center p-3">
              <div className="text-sm text-gray-300">
                You've read {booksReadCount} of {booksTotalCount} books on this list.
              </div>
              <div className="ml-3 text-xl text-gray-300">{booksReadPercentage}%</div>
            </div>
            <div className="overflow-hidden rounded-bl rounded-br bg-gray-800">
              <div
                style={{ width: `${booksReadPercentage}%` }}
                className="h-1 rounded-bl rounded-br bg-gold-500"
              />
            </div>
          </div>

          <div className="sm:mt-6 sm:ml-4 max-w-[160px] text-sm text-gray-300 font-mulish">
            <Toggle
              label="fade read books"
              name="fadeReadBooks"
              defaultValue={fadeRead}
              onChange={setFadeRead}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        {hasNotes && activeView === "grid" && (
          <button
            onClick={() => handleViewChange("card")}
            className="cat-btn-link mr-4 text-sm text-gray-300 font-mulish"
          >
            show notes
          </button>
        )}
        <GridCardViewToggle activeView={activeView} onChange={handleViewChange} />
      </div>
      {activeView === "grid" ? (
        <div className="sm:my-4 p-0 grid grid-cols-4 ml:grid-cols-5 -mx-2 ml:gap-[28px]">
          {list.books!.map((book, index: number) => (
            <ListBook
              key={book!.id}
              book={book}
              isRanked={ranked}
              rank={index + 1}
              fade={fadeRead && hasCurrentUserReadBook(book)}
              showLikedByListCreator
              listCreatorName={name}
            />
          ))}
        </div>
      ) : (
        list.books!.map((book, index: number) => (
          <ListBookCard
            key={book!.id}
            book={book}
            note={bookIdsToNotes[book.id!]}
            isRanked={ranked}
            rank={index + 1}
            fade={fadeRead && hasCurrentUserReadBook(book)}
          />
        ))
      )}

      {(currentUserProfile || comments.length > 0) && (
        <div id="comments" className="mt-24">
          <hr className="my-12 h-[1px] border-none bg-gray-800" />

          {comments.length > 0 && (
            <div className="mt-16">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserProfile={currentUserProfile}
                  onDelete={getComments}
                />
              ))}
            </div>
          )}

          {currentUserProfile && (
            <div id={replyAnchorId} className="mt-8 font-mulish">
              <div className="-mb-2">reply</div>
              <EditComment
                parentId={listId}
                parentType={CommentParentType.List}
                onEditSuccess={getComments}
                onDeleteSuccess={getComments}
                showFormattingReferenceTooltip
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
