"use client"

import { Tooltip } from "react-tooltip"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FaUserCircle } from "react-icons/fa"
import { dateTimeFormats } from "lib/constants/dateTime"
import CustomMarkdown from "app/components/CustomMarkdown"

dayjs.extend(relativeTime)

const { longAmericanDate: timestampFormat } = dateTimeFormats

export default function BlueskyPostCard({ post }) {
  const {
    author: { handle: authorHandle, displayName: authorDisplayName, avatar: authorAvatarUrl },
    record: { text, createdAt },
    embed,
    cid,
  } = post

  const _images = embed?.images || []

  // TODO: authorUrl
  // https://bsky.app/profile/harrisj.bsky.social

  // TODO: postUrl
  // https://bsky.app/profile/harrisj.bsky.social/post/3klud4qrjke22

  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format(timestampFormat)

  const images = _images.map((image) => ({
    src: image.thumb,
    alt: image.alt || "Bluesky image",
  }))

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="mb-2 flex flex-col xs:flex-row items-center">
        {authorAvatarUrl ? (
          <img
            src={authorAvatarUrl}
            alt="user avatar"
            className="mr-2 w-[32px] h-[32px] rounded-full"
          />
        ) : (
          <FaUserCircle className="mr-2 text-3xl text-gold-100" />
        )}
        <div className="xs:my-2 mr-2 text-sm font-mulish">{authorDisplayName}</div>
        <div className="xs:my-2 mr-2 text-gray-500 text-sm font-mulish">@{authorHandle}</div>
        <div className="xs:my-2 xs:ml-2 text-gray-500 text-sm font-mulish">
          <span id={`created-at-${cid}`} className="mr-2">
            {createdAtFromNow}
          </span>
        </div>
      </div>
      <Tooltip anchorSelect={`#created-at-${cid}`} className="max-w-[240px] font-mulish">
        <div className="text-center">{createdAtFormatted}</div>
      </Tooltip>

      <div>
        <CustomMarkdown markdown={text} />
      </div>

      <div className="flex flex-wrap mt-4">
        {images.map((image) => (
          <img key={image.src} src={image.src} alt={image.alt} className="h-32 rounded-sm" />
        ))}
      </div>
    </div>
  )
}
