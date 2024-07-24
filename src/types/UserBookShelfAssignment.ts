import UserBookShelf from "enums/UserBookShelf"
import type Book from "types/Book"

export default interface UserBookShelfAssignment {
  id?: string
  shelf: UserBookShelf
  bookId: string
  userProfileId: string
  createdAt?: Date | string
  updatedAt?: Date | string
  book?: Book
}
