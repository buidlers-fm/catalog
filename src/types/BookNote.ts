import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import type Book from "types/Book"

export default interface BookNote {
  id?: string
  creatorId: string
  bookId: string
  noteType: string
  text?: string
  title?: string
  linkUrl?: string
  startDate?: string | Date
  finishDate?: string | Date
  finished: boolean
  createdAt: Date
  updatedAt: Date
  creator: UserProfile
  book: Book
}