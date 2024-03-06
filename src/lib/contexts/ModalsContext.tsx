"use client"

import { usePathname } from "next/navigation"
import { createContext, useState, useEffect, useMemo, useContext } from "react"
import CurrentModal from "enums/CurrentModal"
import type Book from "types/Book"
import type BookRead from "types/BookRead"

type ModalsProviderValue = {
  currentModal?: CurrentModal
  setCurrentModal: (modal?: CurrentModal) => void
  currentBook?: Book
  setCurrentBook: (book?: Book) => void
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

  const [currentModal, setCurrentModal] = useState<CurrentModal>()
  const [currentBook, setCurrentBook] = useState<Book>()
  const [existingBookRead, setExistingBookRead] = useState<BookRead>()
  const [onNewNoteSuccess, setOnNewNoteSuccess] = useState<() => void>(() => {})
  const [onNewPostSuccess, setOnNewPostSuccess] = useState<() => void>(() => {})

  useEffect(() => {
    setCurrentModal(undefined)
    setExistingBookRead(undefined)
    setOnNewNoteSuccess(() => {})
    setOnNewPostSuccess(() => {})
  }, [pathname])

  const providerValue = useMemo(
    () => ({
      currentModal,
      setCurrentModal,
      currentBook,
      setCurrentBook,
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
