"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import UserProfile from "lib/models/UserProfile"
import type { UserProfileProps } from "lib/models/UserProfile"

export default function FollowButton({
  userProfile: _userProfile,
  currentUserProfile: _currentUserProfile,
}: {
  userProfile: UserProfileProps
  currentUserProfile: UserProfileProps
}) {
  const userProfile = UserProfile.build(_userProfile)
  const currentUserProfile = UserProfile.build(_currentUserProfile)

  const [isFollowing, setIsFollowing] = useState(userProfile.isFollowedBy(currentUserProfile))

  async function follow() {
    setIsFollowing(true)
    await api.follows.create(userProfile.id)
    toast.success(`Now following ${userProfile.name}!`)
  }

  async function unfollow() {
    setIsFollowing(false)
    await api.follows.delete(userProfile.id)
    toast.success(`Unfollowed ${userProfile.name}!`)
  }

  return isFollowing ? (
    <button onClick={unfollow} className="cat-btn cat-btn-sm cat-btn-gold">
      following
    </button>
  ) : (
    <button onClick={follow} className="cat-btn cat-btn-sm cat-btn-gray">
      follow
    </button>
  )
}
