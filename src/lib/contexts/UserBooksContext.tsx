"use client"

import { createContext, useState, useCallback, useEffect, useMemo, useContext } from "react"
import api from "lib/api"
import { useUser } from "lib/contexts/UserContext"
import UserBookShelf from "enums/UserBookShelf"
import InteractionObjectType from "enums/InteractionObjectType"
import type Book from "types/Book"

type UserBooksProviderValue = {
  bookIdsToShelves: { [key: string]: UserBookShelf }
  bookIdsToLiked: { [key: string]: boolean }
  fetchShelfAssignments: () => Promise<void>
  shelveBook: (book: Book, shelf: UserBookShelf) => Promise<void>
  unshelveBook: (bookId: string) => Promise<void>
  likeBook: (book: Book) => Promise<void>
  unlikeBook: (book: Book) => Promise<void>
  setBookIdsToLiked: (bookIdsToLiked: any) => void
  isLoading: boolean
}

const UserBooksContext = createContext<UserBooksProviderValue | undefined>(undefined)

export function UserBooksProvider({ children }) {
  const { currentUserProfile } = useUser()

  const [bookIdsToShelves, setBookIdsToShelves] = useState<{ [key: string]: UserBookShelf }>({})
  const [bookIdsToLiked, setBookIdsToLiked] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchShelfAssignments = useCallback(async () => {
    setIsLoading(true)

    const shelfAssignments = await api.userBookShelves.get()

    setIsLoading(false)

    const _bookIdsToShelves = {}
    shelfAssignments.forEach((assignment) => {
      _bookIdsToShelves[assignment.bookId] = assignment.shelf
    })

    setBookIdsToShelves(_bookIdsToShelves)
  }, [])

  useEffect(() => {
    if (currentUserProfile) {
      fetchShelfAssignments()
    }
  }, [currentUserProfile, fetchShelfAssignments])

  const fetchLikedBooks = useCallback(async () => {
    setIsLoading(true)

    const { likes } = await api.likes.get({
      likedObjectType: InteractionObjectType.Book,
      userProfileId: currentUserProfile?.id,
    })

    setIsLoading(false)

    const _bookIdsToLiked = {}
    likes.forEach((like) => {
      _bookIdsToLiked[like.objectId] = true
    })

    setBookIdsToLiked(_bookIdsToLiked)
  }, [currentUserProfile])

  useEffect(() => {
    if (currentUserProfile) {
      fetchLikedBooks()
    }
  }, [currentUserProfile, fetchLikedBooks])

  const shelveBook = useCallback(async (book: Book, shelf: UserBookShelf) => {
    setIsLoading(true)

    const userBookShelfAssignment = await api.userBookShelves.set({ book, shelf })

    setIsLoading(false)

    const { bookId } = userBookShelfAssignment

    setBookIdsToShelves((prev) => ({
      ...prev,
      [bookId]: shelf,
    }))
  }, [])

  const unshelveBook = useCallback(async (bookId: string) => {
    setIsLoading(true)

    await api.userBookShelves.remove(bookId)

    setIsLoading(false)

    setBookIdsToShelves((prev) => {
      const _prev = { ...prev }
      delete _prev[bookId]
      return _prev
    })
  }, [])

  const likeBook = useCallback(async (book: Book) => {
    setIsLoading(true)

    const like = await api.likes.create({
      likedObjectType: InteractionObjectType.Book,
      likedObject: book,
    })

    setIsLoading(false)

    const { objectId } = like

    setBookIdsToLiked((prev) => ({
      ...prev,
      [objectId]: true,
    }))
  }, [])

  const unlikeBook = useCallback(async (book: Book) => {
    setIsLoading(true)

    await api.likes.deleteByParams({
      likedObjectType: InteractionObjectType.Book,
      likedObjectId: book.id,
    })

    setIsLoading(false)

    if (book.id) {
      setBookIdsToLiked((prev) => {
        const _prev = { ...prev }
        delete _prev[book.id!]
        return _prev
      })
    }
  }, [])

  const providerValue = useMemo(
    () => ({
      bookIdsToShelves,
      bookIdsToLiked,
      fetchShelfAssignments,
      shelveBook,
      unshelveBook,
      likeBook,
      unlikeBook,
      setBookIdsToLiked,
      isLoading,
    }),
    [
      bookIdsToShelves,
      bookIdsToLiked,
      fetchShelfAssignments,
      shelveBook,
      unshelveBook,
      likeBook,
      unlikeBook,
      setBookIdsToLiked,
      isLoading,
    ],
  )

  return <UserBooksContext.Provider value={providerValue}>{children}</UserBooksContext.Provider>
}

export function useUserBooks() {
  const context = useContext(UserBooksContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserBooksProvider")
  }
  return context
}
