import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { dbBookToBook } from "lib/helpers/general"
import type List from "types/List"
import type Book from "types/Book"

export default function useEditBookList(list?: List) {
  const [books, setBooks] = useState<Book[]>([])
  const [isDirty, setIsDirty] = useState<boolean>(false)

  useEffect(() => {
    if (!list) return
    const _books = list.dbBooks!.map((dbBook) => dbBookToBook(dbBook))
    setBooks(_books)
  }, [list])

  const addBook = (selectedBook: Book) => {
    const bookAlreadyInList = books.some(
      (b) => b.openLibraryWorkId === selectedBook.openLibraryWorkId,
    )
    if (bookAlreadyInList) {
      toast.error("This book is already in your list!")
      return
    }

    const updatedBooks = [...books, selectedBook]
    setBooks(updatedBooks)
    setIsDirty(true)
  }

  const removeBook = (book: Book) => {
    const updatedBooks = books.filter((b) => b.openLibraryWorkId !== book.openLibraryWorkId)
    setBooks(updatedBooks)
    setIsDirty(true)
  }

  const reorderBooks = (sortedIds: string[]) => {
    const _books = [...books]

    const updatedBooks = _books.sort((a, b) => {
      const idA = sortedIds.indexOf(a.openLibraryWorkId!)
      const idB = sortedIds.indexOf(b.openLibraryWorkId!)

      if (idA === -1 || idB === -1) throw new Error("There was a problem reordering the books.")

      return idA - idB
    })

    setBooks(updatedBooks)
    setIsDirty(true)
  }

  return {
    books,
    addBook,
    removeBook,
    reorderBooks,
    isDirty,
  }
}
