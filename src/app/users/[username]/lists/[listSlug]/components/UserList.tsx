"use client"

import Link from "next/link"
import { Tooltip } from "react-tooltip"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import ListBook from "app/lists/components/ListBook"
import { getUserProfileLink, getEditListLink } from "lib/helpers/general"

dayjs.extend(relativeTime)

export default function UserList({ userProfile, list, isUsersList }) {
  const { title, slug: listSlug, description, createdAt, ranked, updatedAt: _updatedAt } = list
  const { username, displayName } = userProfile!
  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format("MMMM D, YYYY")
  const updatedAt = _updatedAt || createdAt
  const updatedAtFromNow = dayjs(updatedAt).fromNow()
  const updatedAtFormatted = dayjs(updatedAt).format("MMMM D, YYYY")

  return (
    <div className="mt-4 xs:w-[400px] sm:w-[600px] ml:w-[832px] mx-auto">
      <div className="sm:flex">
        <div className="text-4xl font-semibold mb-1">{title}</div>
        {isUsersList && (
          <Link href={getEditListLink(userProfile, listSlug)}>
            <button className="cat-btn cat-btn-sm cat-btn-gray my-2 sm:my-0 sm:ml-6">
              Edit list
            </button>
          </Link>
        )}
      </div>
      <div className="my-2 text-gray-200 font-mulish">
        a list by{" "}
        <Link href={getUserProfileLink(username)} className="cat-underline">
          {displayName}
        </Link>
      </div>
      <div className="my-3 text-gray-500 text-sm font-mulish">
        created <span id="created-at">{createdAtFromNow}</span>, last updated{" "}
        <span id="updated-at">{updatedAtFromNow}</span>
      </div>
      <Tooltip anchorSelect="#created-at" className="max-w-[240px] font-mulish">
        <div className="text-center">{createdAtFormatted}</div>
      </Tooltip>
      <Tooltip anchorSelect="#updated-at" className="max-w-[240px] font-mulish">
        <div className="text-center">{updatedAtFormatted}</div>
      </Tooltip>
      <div className="sm:my-4">{description}</div>
      <div className="sm:my-8 p-0 grid grid-cols-4 ml:grid-cols-5 -mx-2 ml:gap-[28px]">
        {list.books.map((book, index: number) => (
          <ListBook key={book!.id} book={book} isRanked={ranked} rank={index + 1} />
        ))}
      </div>
    </div>
  )
}
