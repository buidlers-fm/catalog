import Link from "next/link"
import CustomMarkdown from "app/components/CustomMarkdown"
import {
  getUserProfileLink,
  getListLink,
  getPostLink,
  getNoteLink,
  truncateString,
} from "lib/helpers/general"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import UserProfile from "lib/models/UserProfile"
import NotificationType from "enums/NotificationType"
import NotificationObjectType from "enums/NotificationObjectType"
import NotificationSourceType from "enums/NotificationSourceType"
import BookNoteType from "enums/BookNoteType"

const TEXT_TRUNCATE_LENGTH = 60

export default function NotifCard({ notif, currentUserProfile }) {
  const { id, type, agent: _agent, objectType, object, sourceType, createdAt } = notif

  const agent = UserProfile.build(_agent)

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
    <div className="px-2 py-4 text-gray-300 border-b-[1px] border-b-gray-800 last:border-none">
      {type === NotificationType.Follow && (
        <>
          <AgentLink agent={agent} /> followed you.
        </>
      )}

      {type === NotificationType.Like && (
        <>
          <AgentLink agent={agent} /> liked your{" "}
          <ObjectText
            agent={agent}
            object={object}
            objectType={objectType}
            currentUserProfile={currentUserProfile}
          />
          .
        </>
      )}

      {type === NotificationType.Comment && (
        <>
          <AgentLink agent={agent} /> commented on your{" "}
          <ObjectText
            agent={agent}
            object={object}
            objectType={objectType}
            currentUserProfile={currentUserProfile}
          />
          .
        </>
      )}

      {type === NotificationType.Mention && (
        <>
          <AgentLink agent={agent} /> mentioned you in{" "}
          {sourceType === NotificationSourceType.Comment ? "their comment on the" : "their"}{" "}
          <ObjectText
            agent={agent}
            object={object}
            objectType={objectType}
            currentUserProfile={currentUserProfile}
          />
          .
        </>
      )}

      <span id={timestampTooltipAnchorId} className="ml-2 text-sm text-gray-500">
        {createdAtFromNow}
      </span>
      {timestampTooltip}
    </div>
  )
}

function AgentLink({ agent }) {
  return (
    <Link href={getUserProfileLink(agent.username)} className="cat-link text-white">
      {agent.name}
    </Link>
  )
}

// when quoting object's text, render paragraphs as inline
const componentOverrides = {
  p: ({ children }) => children,
}

function ObjectText({ agent, object, objectType: _objectType, currentUserProfile }) {
  let objectType = _objectType
  if (objectType === NotificationObjectType.BookNote) {
    objectType = object.noteType === BookNoteType.JournalEntry ? "note" : "post"
  }

  if (objectType === NotificationObjectType.UserCurrentStatus) {
    return "current status"
  }

  const _text = object.title || object.text
  const text = truncateString(_text, TEXT_TRUNCATE_LENGTH)

  let objectLink
  if (objectType === "post") {
    objectLink = getPostLink(object.id)
  } else if (objectType === "note") {
    objectLink = getNoteLink(object.id)
  } else if (
    objectType === NotificationObjectType.List &&
    object.creatorId === currentUserProfile.id
  ) {
    objectLink = getListLink(currentUserProfile, object.slug)
  } else if (objectType === NotificationObjectType.List && object.creatorId === agent.id) {
    objectLink = getListLink(agent, object.slug)
  }

  if (objectLink) {
    return (
      <>
        {objectType}{" "}
        <Link href={objectLink} className="cat-link text-white">
          {text}
        </Link>
      </>
    )
  } else {
    return (
      <>
        {objectType}{" "}
        <div className="inline text-white">
          <CustomMarkdown
            markdown={text}
            componentOverrides={componentOverrides}
            moreClasses="inline"
          />
        </div>
      </>
    )
  }
}
