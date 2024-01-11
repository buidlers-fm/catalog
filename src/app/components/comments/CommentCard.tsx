"use client"

import { useState } from "react"
import { MdEdit } from "react-icons/md"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import EditComment from "app/components/comments/EditComment"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import ExpandableText from "app/components/ExpandableText"

const TEXT_TRUNCATE_LENGTH = 500

export default function CommentCard({ comment, currentUserProfile, onDelete }) {
  const { id, commenter, text: _text, parentId, parentType, createdAt } = comment

  const [text, setText] = useState<string>(_text)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const timestampTooltipAnchorId = `comment-created-at-${id}`

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  async function handleEditSuccess(editedComment) {
    setIsEditing(false)
    setText(editedComment.text)
  }

  const isOwnComment = currentUserProfile && currentUserProfile.id === commenter.id

  return (
    <div className="my-4 px-4 py-1 border-l-2 border-l-gray-500 font-mulish">
      <div className="flex flex-col xs:flex-row">
        <NameWithAvatar userProfile={commenter} />

        <div className="xs:ml-2 xs:mt-2 text-sm text-gray-500">
          <span id={timestampTooltipAnchorId}>{createdAtFromNow}</span>
        </div>

        {timestampTooltip}

        {isOwnComment && !isEditing && (
          <button
            type="button"
            className="ml-1.5 text-lg text-gray-300"
            onClick={() => setIsEditing(true)}
          >
            <MdEdit className="" />
          </button>
        )}
      </div>
      {isEditing ? (
        <EditComment
          comment={comment}
          parentId={parentId}
          parentType={parentType}
          onEditSuccess={handleEditSuccess}
          onDeleteSuccess={onDelete}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="my-2 font-newsreader">
          <ExpandableText text={text} maxChars={TEXT_TRUNCATE_LENGTH} />
        </div>
      )}
    </div>
  )
}
