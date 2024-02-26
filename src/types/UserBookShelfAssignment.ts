import UserBookShelf from "enums/UserBookShelf"

export default interface UserBookShelfAssignment {
  id?: string
  shelf: UserBookShelf
  bookId: string
  userProfileId: string
  createdAt?: Date | string
  updatedAt?: Date | string
}
