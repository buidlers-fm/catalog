import { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import type Book from "types/Book"

export default interface UserCurrentStatus {
  id?: string
  userProfileId: string
  bookId?: string
  text?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  userProfile?: UserProfile
  book?: Book
}
