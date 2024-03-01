"use client"

import { Tooltip } from "react-tooltip"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FaUserCircle } from "react-icons/fa"
import { dateTimeFormats } from "lib/constants/dateTime"
import { truncateString } from "lib/helpers/strings"
import CustomMarkdown from "app/components/CustomMarkdown"
import BlueskyLogo from "app/components/BlueskyLogo"

dayjs.extend(relativeTime)

const { longAmericanDate: timestampFormat } = dateTimeFormats

function parsePostUri(uri) {
  const match = uri.match(/^at:\/\/(.*?)\/app.bsky.+.post\/(.*)$/)

  if (!match) return {}

  return { did: match[1], postId: match[2] }
}

export default function BlueskyPostCard({ post, embedded = false }) {
  const {
    author: { handle: authorHandle, displayName: authorDisplayName, avatar: authorAvatarUrl },
    embeds,
    record,
    cid,
    value,
    uri,
  } = post

  const createdAt = embedded ? value?.createdAt : record?.createdAt
  const text = embedded ? value?.text : record?.text
  const embed = embedded ? value?.embed : post.embed

  const _images = (embedded ? embeds[0]?.images : embed?.images) || []
  const externalLink = embed?.external || embed?.media?.external

  let embeddedPost
  const possibleEmbeddedPost = embed?.record?.record || embed?.record

  if (possibleEmbeddedPost?.author) {
    embeddedPost = possibleEmbeddedPost
  }

  const authorUrl = `https://bsky.app/profile/${authorHandle}`

  let postUrl
  if (uri) {
    const { postId } = parsePostUri(uri)
    postUrl = `https://bsky.app/profile/${authorHandle}/post/${postId}`
  }

  const createdAtFromNow = dayjs(createdAt).fromNow()
  const createdAtFormatted = dayjs(createdAt).format(timestampFormat)

  const images = _images.map((image) => ({
    src: image.thumb,
    alt: image.alt || "Bluesky image",
  }))

  return (
    <div className="px-2 py-6 border-b-[1px] border-b-gray-500 last:border-none">
      <div className="mb-2">
        <a href={authorUrl} target="_blank" rel="noopener noreferrer">
          <div className="flex mr-4">
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt="user avatar"
                className="mt-1 mr-2 w-[32px] h-[32px] rounded-full"
              />
            ) : (
              <FaUserCircle className="mr-2 text-3xl text-gold-100" />
            )}
            <div className="mb-2">
              <div className="mr-2 text-sm font-mulish">{authorDisplayName}</div>
              <div className="mr-2 text-gray-500 text-sm font-mulish">@{authorHandle}</div>
            </div>
          </div>
        </a>
      </div>
      <Tooltip anchorSelect={`#created-at-${cid}`} className="max-w-[240px] font-mulish">
        <div className="text-center">{createdAtFormatted}</div>
      </Tooltip>

      <div>
        <CustomMarkdown markdown={text} />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap mt-4">
          {images.map((image) => (
            <img key={image.src} src={image.src} alt={image.alt} className="h-48 rounded-sm" />
          ))}
        </div>
      )}

      {externalLink && (
        <div className="flex flex-wrap mt-4">
          <a
            href={externalLink.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border border-gray-300 rounded"
          >
            {externalLink.title}
            <div className="text-sm text-gray-300">
              {truncateString(externalLink.description || externalLink.uri, 150)}
            </div>
          </a>
        </div>
      )}

      {embeddedPost && (
        <div className="my-4 px-2 border border-gray-300 rounded">
          <BlueskyPostCard post={embeddedPost} embedded />
        </div>
      )}

      {!embedded && (
        <div className="mt-4 flex justify-end items-center text-gray-500 text-sm font-mulish">
          <span id={`created-at-${cid}`} className="mr-1">
            {createdAtFromNow}
          </span>

          <div className="-mt-1 h-8 w-8">
            <a href={postUrl} className="w-full h-full" rel="noopener noreferrer">
              <BlueskyLogo color="gray" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
