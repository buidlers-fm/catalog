"use client"

import UserProfile from "lib/models/UserProfile"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"

export default function UserListsIndex({ lists, userProfile: _userProfile, currentUserProfile }) {
  const userProfile = UserProfile.build(_userProfile)

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="mt-8">
        {lists.length > 0 ? (
          <div className="">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} currentUserProfile={currentUserProfile} />
            ))}
          </div>
        ) : (
          <EmptyState text={`${userProfile.name} doesn't have any lists yet.`} />
        )}
      </div>
    </div>
  )
}
