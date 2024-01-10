"use client"

import { getFormattedTimestamps } from "lib/helpers/dateTime"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import CustomMarkdown from "app/components/CustomMarkdown"

export default function CommentCard({ comment }) {
  const { id, commenter, text, createdAt } = comment
  const timestampTooltipAnchorId = `comment-created-at-${id}`

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  return (
    <div className="my-4 px-4 py-1 border-l-2 border-l-gray-500 font-mulish">
      <div className="flex flex-col xs:flex-row">
        <NameWithAvatar userProfile={commenter} />

        <div className="xs:ml-2 xs:mt-2 text-sm text-gray-500">
          <span id={timestampTooltipAnchorId}>{createdAtFromNow}</span>
        </div>
        {timestampTooltip}
      </div>
      <div className="my-2 font-newsreader">
        <CustomMarkdown markdown={text} />
      </div>
    </div>
  )
}
