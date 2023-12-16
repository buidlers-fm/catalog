"use client"

import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import CurrentStatus from "app/users/[username]/components/CurrentStatus"

export default function UserCurrentStatusCard({ userProfile, userCurrentStatus }) {
  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <NameWithAvatar userProfile={userProfile} />
      <CurrentStatus
        userProfile={userProfile}
        userCurrentStatus={userCurrentStatus}
        isUsersProfile={false}
        isProfilePage={false}
      />
    </div>
  )
}
