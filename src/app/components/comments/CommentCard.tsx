"use client"

import { useState } from "react"
import { MdEdit } from "react-icons/md"
import { FaRegComment } from "react-icons/fa"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import EditComment from "app/components/comments/EditComment"
import SaveBookmark from "app/components/saves/SaveBookmark"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import ExpandableText from "app/components/ExpandableText"
import Likes from "app/components/Likes"
import InteractionObjectType from "enums/InteractionObjectType"

const TEXT_TRUNCATE_LENGTH = 500

type Props = {
  comment: any
  currentUserProfile: any
  onDelete: () => void
  isReplying?: boolean
  onClickReply?: () => void
}

export default function CommentCard({
  comment,
  currentUserProfile,
  onDelete,
  isReplying = false,
  onClickReply,
}: Props) {
  const {
    id,
    commenter,
    text: _text,
    parentId,
    parentType,
    createdAt,
    likeCount,
    currentUserLike,
    depth,
    save,
  } = comment

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
      <div className="flex flex-wrap">
        <NameWithAvatar userProfile={commenter} />

        <div className="flex">
          <div className="ml-2 mt-2 text-sm text-gray-500">
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

      <div className="flex items-center my-3">
        <Likes
          interactive={!!currentUserProfile}
          likedObject={comment}
          likedObjectType={InteractionObjectType.Comment}
          likeCount={likeCount}
          currentUserLike={currentUserLike}
        />

        {!!currentUserProfile && !isReplying && depth < 2 && onClickReply && (
          <div className="flex items-center">
            <FaRegComment className="ml-2 mr-1.5 text-gray-500 text-md" />
            <button
              className="flex border-b border-b-gray-500 text-sm text-gray-500"
              onClick={onClickReply}
            >
              reply
            </button>
          </div>
        )}

        {currentUserProfile && id && (
          <div className="ml-4">
            <SaveBookmark
              savedObjectType={InteractionObjectType.Comment}
              savedObjectId={id}
              saveId={save?.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}
