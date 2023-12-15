import { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import Book from "types/Book"
import BookNote from "types/BookNote"
import BookReadStatus from "enums/BookReadStatus"

export default interface BookRead {
  id?: string
  readerId: string
  bookId: string
  status: BookReadStatus
  startDate?: string | Date
  endDate?: string | Date
  createdAt: string | Date
  updatedAt: string | Date
  reader: UserProfile
  book: Book
  bookNotes?: BookNote[]
}
