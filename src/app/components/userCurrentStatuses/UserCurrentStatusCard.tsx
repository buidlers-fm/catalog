"use client"

import { getFormattedTimestamps } from "lib/helpers/dateTime"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import CurrentStatus from "app/users/[username]/components/CurrentStatus"

export default function UserCurrentStatusCard({ userProfile, userCurrentStatus }) {
  const { createdAt } = userCurrentStatus || {}
  const timestampTooltipAnchorId = `current-status-created-at-${userCurrentStatus.id}`

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex flex-col xs:flex-row">
        <NameWithAvatar userProfile={userProfile} />

        <div className="xs:ml-2 xs:mt-2 text-sm text-gray-500">
          <span id={timestampTooltipAnchorId}>{createdAtFromNow}</span>
        </div>
        {timestampTooltip}
      </div>
      <CurrentStatus
        userProfile={userProfile}
        userCurrentStatus={userCurrentStatus}
        isUsersProfile={false}
        isProfilePage={false}
      />
    </div>
  )
}
