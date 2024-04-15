"use client"

import { usePathname } from "next/navigation"
import { createContext, useState, useEffect, useMemo, useContext } from "react"
import { useUser } from "lib/contexts/UserContext"
import CurrentModal from "enums/CurrentModal"
import type Book from "types/Book"
import type BookRead from "types/BookRead"

type ModalsProviderValue = {
  currentModal?: CurrentModal
  setCurrentModal: (modal?: CurrentModal) => void
  currentBook?: Book
  setCurrentBook: (book?: Book) => void
  potentialCurrentBook?: Book
  setPotentialCurrentBook: (book?: Book) => void
  existingBookRead?: BookRead
  setExistingBookRead: (bookRead?: BookRead) => void
  onNewNoteSuccess: () => void
  setOnNewNoteSuccess: (onSuccess: () => void) => void
  onNewPostSuccess: () => void
  setOnNewPostSuccess: (onSuccess: () => void) => void
}

const ModalsContext = createContext<ModalsProviderValue | undefined>(undefined)

export function ModalsProvider({ children }) {
  const pathname = usePathname()
  const { currentUserProfile } = useUser()

  const [currentModal, setCurrentModal] = useState<CurrentModal>()
  const [currentBook, setCurrentBook] = useState<Book>()
  const [potentialCurrentBook, setPotentialCurrentBook] = useState<Book>()
  const [existingBookRead, setExistingBookRead] = useState<BookRead>()
  const [onNewNoteSuccess, setOnNewNoteSuccess] = useState<() => void>(() => {})
  const [onNewPostSuccess, setOnNewPostSuccess] = useState<() => void>(() => {})

  // offer intro tour if user hasn't seen it yet
  useEffect(() => {
    if (
      currentUserProfile &&
      currentUserProfile.config &&
      !currentUserProfile.config.seenIntroTour
    ) {
      setCurrentModal(CurrentModal.IntroTourPreTour)
    }
  }, [setCurrentModal, currentUserProfile])

  // reset params for book-related modals
  useEffect(() => {
    setCurrentBook(undefined)
    setExistingBookRead(undefined)
    setOnNewNoteSuccess(() => {})
    setOnNewPostSuccess(() => {})

    if (!pathname.includes("/books")) {
      setPotentialCurrentBook(undefined)
    }
  }, [pathname])

  const providerValue = useMemo(
    () => ({
      currentModal,
      setCurrentModal,
      currentBook,
      setCurrentBook,
      potentialCurrentBook,
      setPotentialCurrentBook,
      existingBookRead,
      setExistingBookRead,
      onNewNoteSuccess,
      setOnNewNoteSuccess,
      onNewPostSuccess,
      setOnNewPostSuccess,
    }),
    [
      currentModal,
      setCurrentModal,
      currentBook,
      setCurrentBook,
      potentialCurrentBook,
      setPotentialCurrentBook,
      existingBookRead,
      setExistingBookRead,
      onNewNoteSuccess,
      setOnNewNoteSuccess,
      onNewPostSuccess,
      setOnNewPostSuccess,
    ],
  )

  return <ModalsContext.Provider value={providerValue}>{children}</ModalsContext.Provider>
}

export function useModals() {
  const context = useContext(ModalsContext)
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalsProvider")
  }
  return context
}
