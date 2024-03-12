"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useUser } from "lib/contexts/UserContext"
import api from "lib/api"
import { getNoteLink, getPostLink, getListLinkById } from "lib/helpers/general"
import LoadingSection from "app/components/LoadingSection"
import BookNoteCard from "app/components/bookNotes/BookNoteCard"
import BookLinkPostCard from "app/components/bookPosts/BookPostCard"
import CommentCard from "app/components/comments/CommentCard"
import ListCard from "app/components/lists/ListCard"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"

enum Filter {
  All = "all",
  Note = InteractionObjectType.Note,
  Post = InteractionObjectType.Post,
  Comment = InteractionObjectType.Comment,
  List = InteractionObjectType.List,
}

const filterToCopy = {
  [Filter.All]: "all",
  [Filter.Note]: "notes",
  [Filter.Post]: "posts",
  [Filter.Comment]: "comments",
  [Filter.List]: "lists",
}

export default function SavedItems() {
  const { currentUserProfile } = useUser()

  const [savedItems, setSavedItems] = useState<any[]>()
  const [currentFilter, setCurrentFilter] = useState<Filter>(Filter.All)
  const [visibleItems, setVisibleItems] = useState<any[]>()

  const fetchSavedItems = async () => {
    const _savedItems = await api.saves.get()
    setSavedItems(_savedItems)
  }

  useEffect(() => {
    fetchSavedItems()
  }, [])

  useEffect(() => {
    const _visibleItems = savedItems?.filter((item) => {
      if (currentFilter === Filter.All) return true
      return item.save.objectType === currentFilter
    })

    setVisibleItems(_visibleItems)
  }, [savedItems, currentFilter])

  return (
    <div className="w-full sm:w-[576px] px-8 sm:px-16">
      <div className="cat-page-title">your saved items</div>
      <hr className="my-1 h-[1px] border-none bg-white" />

      <div className="flex justify-end items-baseline mt-4 text-gray-300 font-mulish">
        filter by type:
        <select
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value as Filter)}
          className="ml-2 bg-gray-900 text-white border-none rounded"
        >
          {Object.keys(filterToCopy).map((filter) => (
            <option key={filter} value={filter}>
              {filterToCopy[filter]}
            </option>
          ))}
        </select>
      </div>

      {visibleItems ? (
        visibleItems.map((savedItem) => (
          <div key={savedItem.id} className="py-4 border-b border-b-gray-300 last:border-none">
            {savedItem.save.objectType === InteractionObjectType.Note && (
              <div className="mt-2">
                <div className="cat-eyebrow">note</div>
                <BookNoteCard
                  note={savedItem}
                  currentUserProfile={currentUserProfile || undefined}
                  onEditSuccess={fetchSavedItems}
                  onDeleteSuccess={fetchSavedItems}
                  onSaveUnsave={fetchSavedItems}
                />
              </div>
            )}

            {savedItem.save.objectType === InteractionObjectType.Post && (
              <div className="mt-2">
                <div className="cat-eyebrow">post</div>
                <BookLinkPostCard
                  post={savedItem}
                  currentUserProfile={currentUserProfile || undefined}
                  onEditSuccess={fetchSavedItems}
                  onDeleteSuccess={fetchSavedItems}
                  onSaveUnsave={fetchSavedItems}
                />
              </div>
            )}

            {savedItem.save.objectType === InteractionObjectType.Comment && (
              <div className="mt-2">
                <div className="cat-eyebrow">
                  comment on{" "}
                  {savedItem.rootObjectType === CommentParentType.Note && (
                    <Link href={getNoteLink(savedItem.rootObjectId)} className="cat-link">
                      a note
                    </Link>
                  )}
                  {savedItem.rootObjectType === CommentParentType.Post && (
                    <Link href={getPostLink(savedItem.rootObjectId)} className="cat-link">
                      a post
                    </Link>
                  )}
                  {savedItem.rootObjectType === CommentParentType.List && (
                    <Link href={getListLinkById(savedItem.rootObjectId)} className="cat-link">
                      a list
                    </Link>
                  )}
                  {/* the below case shouldn't exist (where root object is a comment), but in case of a bug */}
                  {savedItem.rootObjectType === CommentParentType.Comment && "a comment"}
                </div>
                <CommentCard
                  comment={savedItem}
                  currentUserProfile={currentUserProfile || undefined}
                  onDelete={fetchSavedItems}
                  onSaveUnsave={fetchSavedItems}
                />
              </div>
            )}

            {savedItem.save.objectType === InteractionObjectType.List && (
              <div className="mt-2">
                <div className="cat-eyebrow -mb-4">list</div>
                <ListCard
                  list={savedItem}
                  currentUserProfile={currentUserProfile || undefined}
                  withByline
                  onSaveUnsave={fetchSavedItems}
                />
              </div>
            )}
          </div>
        ))
      ) : (
        <LoadingSection />
      )}
    </div>
  )
}
