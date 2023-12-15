"use client"

import { useState } from "react"
import { MdEdit } from "react-icons/md"
import UserProfile from "lib/models/UserProfile"
import EditProfileCurrentStatus from "app/users/[username]/components/EditProfileCurrentStatus"
import CurrentStatus from "app/users/[username]/components/CurrentStatus"

export default function ProfileCurrentStatus({
  userProfile: _userProfile,
  userCurrentStatus: _userCurrentStatus,
  isUsersProfile,
}) {
  const [userCurrentStatus, setUserCurrentStatus] = useState<any>(_userCurrentStatus)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const userProfile = UserProfile.build(_userProfile)

  function handleEditSuccess(updatedStatus) {
    setUserCurrentStatus(updatedStatus)
    setIsEditing(false)
  }

  function handleDeleteSuccess() {
    setUserCurrentStatus(undefined)
    setIsEditing(false)
  }

  return (
    <>
      <div className="cat-eyebrow flex justify-between">
        current status
        {isUsersProfile && !isEditing && (
          <button onClick={() => setIsEditing(true)}>
            <MdEdit className="inline-block -mt-1 text-lg text-gray-300" />
          </button>
        )}
      </div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      {isEditing ? (
        <EditProfileCurrentStatus
          userCurrentStatus={userCurrentStatus}
          onEditSuccess={handleEditSuccess}
          onDeleteSuccess={handleDeleteSuccess}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <CurrentStatus
          userProfile={userProfile}
          userCurrentStatus={userCurrentStatus}
          isUsersProfile={isUsersProfile}
        />
      )}
    </>
  )
}
