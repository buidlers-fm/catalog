import type Book from "types/Book"

export default interface Adaptation {
  id: string
  title: string
  type: string
  year?: number
  dateString?: string
  tmdbUrl?: string
  letterboxdUrl?: string
  wikipediaUrl?: string
  bookId: string
  createdAt: Date | string
  updatedAt?: Date | string
  book?: Book
}
