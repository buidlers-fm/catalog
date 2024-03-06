"use client"

import { useState, useEffect } from "react"
import { useUser } from "lib/contexts/UserContext"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import { useModals } from "lib/contexts/ModalsContext"
import api from "lib/api"
import AddBookToListsModal from "app/lists/components/AddBookToListsModal"
import BookNoteModal from "app/components/BookNoteModal"
import NewBookPostModal from "app/components/NewBookPostModal"
import CurrentModal from "enums/CurrentModal"
import type List from "types/List"

export default function Modals() {
  const { currentUserProfile } = useUser()
  const { bookIdsToLiked } = useUserBooks()
  const {
    currentModal,
    setCurrentModal,
    currentBook,
    existingBookRead,
    onNewNoteSuccess,
    onNewPostSuccess,
  } = useModals()

  const [userLists, setUserLists] = useState<List[]>([])

  const isSignedIn = !!currentUserProfile

  const isBookLiked = currentBook?.id ? bookIdsToLiked[currentBook.id] : false

  useEffect(() => {
    async function getUserLists() {
      const _userLists = await api.lists.get({
        userProfileId: currentUserProfile!.id,
      })

      setUserLists(_userLists)
    }

    if (currentUserProfile) getUserLists()
  }, [currentUserProfile])

  if (!isSignedIn) {
    return null
  }

  if (!currentBook) {
    return null
  }

  return (
    <>
      {currentModal === CurrentModal.AddBookToLists && (
        <AddBookToListsModal
          book={currentBook}
          userLists={userLists}
          isOpen
          onClose={() => setCurrentModal(undefined)}
        />
      )}

      {currentModal === CurrentModal.NewNote && (
        <BookNoteModal
          book={currentBook}
          like={isBookLiked}
          existingBookRead={existingBookRead}
          isOpen
          onClose={() => setCurrentModal(undefined)}
          onSuccess={onNewNoteSuccess}
        />
      )}

      {currentModal === CurrentModal.NewPost && (
        <NewBookPostModal
          book={currentBook}
          isOpen
          onClose={() => setCurrentModal(undefined)}
          onSuccess={onNewPostSuccess}
        />
      )}
    </>
  )
}
