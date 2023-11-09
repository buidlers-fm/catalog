"use client"

import ListCard from "app/components/lists/ListCard"

export default function UserListsIndex({ lists, userProfile }) {
  return (
    <div className="mt-4 max-w-3xl mx-auto font-nunito-sans">
      <div className="cat-page-title">{userProfile.username}'s lists</div>
      <div className="mt-8">
        {lists.length > 0 ? (
          <div className="">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
            {userProfile.username} doesn't have any lists yet.
          </div>
        )}
      </div>
    </div>
  )
}
