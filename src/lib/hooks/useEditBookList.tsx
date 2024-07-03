import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import type List from "types/List"
import type Book from "types/Book"

type Options = {
  defaultSort?: (a, b) => number
}

export default function useEditBookList(list?: List, options: Options = {}) {
  const [books, setBooks] = useState<Book[]>([])
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const { defaultSort } = options

  useEffect(() => {
    if (!list?.books) return
    setBooks(list.books)
  }, [list])

  const addBook = (selectedBook: Book) => {
    const bookAlreadyInList = books.some(
      (b) => b.openLibraryWorkId === selectedBook.openLibraryWorkId,
    )
    if (bookAlreadyInList) {
      toast.error("This book is already in your list!")
      return
    }

    let updatedBooks = [...books, selectedBook]

    if (defaultSort) {
      updatedBooks = updatedBooks.sort(defaultSort)
    }

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
    setBooks,
    addBook,
    removeBook,
    reorderBooks,
    isDirty,
  }
}
