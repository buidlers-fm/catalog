import UserBookShelf from "enums/UserBookShelf"

export default interface UserBookShelfAssignment {
  id?: string
  status: UserBookShelf
  bookId: string
  userProfileId: string
  createdAt?: string
  updatedAt?: string
}
