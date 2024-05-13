"use client"

import { useState, useEffect } from "react"
import { FaHeart } from "react-icons/fa"
import api from "lib/api"
import ListBook from "app/lists/components/ListBook"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import LoadingSection from "app/components/LoadingSection"
import EmptyState from "app/components/EmptyState"
import UserBookShelf, { shelfToCopy } from "enums/UserBookShelf"

const shelfToCopyOverride = {
  ...shelfToCopy,
  [UserBookShelf.CurrentlyReading]: "reading", // shorten copy for alignment
}

export default function FriendsLatestShelved() {
  const [shelfAssignments, setShelfAssignments] = useState<any[]>()

  useEffect(() => {
    async function fetchShelfAssignments() {
      const _shelfAssignments = await api.home.activity.get()
      setShelfAssignments(_shelfAssignments)
    }

    fetchShelfAssignments()
  }, [])

  return (
    <div className="mt-4 mb-16 w-[300px] sm:w-[576px] mx-auto">
      <div className="cat-eyebrow">latest from friends</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      {shelfAssignments ? (
        shelfAssignments.length > 0 ? (
          <div className="sm:my-4 p-0 grid grid-cols-2 sm:grid-cols-4 -mx-2 ml:gap-x-[28px]">
            {shelfAssignments.map((shelfAssignment) => (
              <div key={shelfAssignment.id} className="flex flex-col justify-between">
                <div className="-mb-4">
                  <ListBook
                    book={shelfAssignment.book}
                    widthClasses="w-[144px]"
                    heightClasses="h-[216px]"
                  />
                </div>
                <div className="ml-1 -mb-2">
                  <div className="-mb-1">
                    <NameWithAvatar userProfile={shelfAssignment.userProfile} maxChars={13} />
                  </div>
                  <div className="font-mulish text-sm">
                    {shelfToCopyOverride[shelfAssignment.shelf]}
                    {shelfAssignment.likedByFriend && (
                      <FaHeart className="text-red-300 inline-block ml-2 -mt-0.5" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Your friends haven't shelved any books recently." />
        )
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
