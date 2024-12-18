"use client"

import { useState, useEffect } from "react"
import { useUser } from "lib/contexts/UserContext"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import { useModals } from "lib/contexts/ModalsContext"
import api from "lib/api"
import IntroTourPreTourModal from "app/components/IntroTourPreTourModal"
import GlobalCreateModal from "app/components/GlobalCreateModal"
import InvitesModal from "app/components/invites/InvitesModal"
import AddBookToListsModal from "app/lists/components/AddBookToListsModal"
import BookNoteModal from "app/components/BookNoteModal"
import NewBookPostModal from "app/components/NewBookPostModal"
import RecommendBookModal from "app/components/RecommendBookModal"
import CurrentModal from "enums/CurrentModal"
import type List from "types/List"

export default function Modals() {
  const { currentUserProfile } = useUser()
  const { bookIdsToLiked } = useUserBooks()
  const { currentModal, setCurrentModal, currentBook, existingBookRead } = useModals()

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

  return (
    <>
      {currentModal === CurrentModal.IntroTourPreTour && (
        <IntroTourPreTourModal
          isOpen
          currentUserProfile={currentUserProfile}
          onClose={() => setCurrentModal(undefined)}
        />
      )}

      {currentModal === CurrentModal.GlobalCreate && (
        <GlobalCreateModal isOpen onClose={() => setCurrentModal(undefined)} />
      )}

      {currentModal === CurrentModal.Invites && (
        <InvitesModal isOpen onClose={() => setCurrentModal(undefined)} />
      )}

      {currentBook && (
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
            />
          )}

          {currentModal === CurrentModal.NewPost && (
            <NewBookPostModal
              book={currentBook}
              isOpen
              onClose={() => setCurrentModal(undefined)}
            />
          )}

          {currentModal === CurrentModal.RecommendBook && (
            <RecommendBookModal book={currentBook} isOpen />
          )}
        </>
      )}
    </>
  )
}
