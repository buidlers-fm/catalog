import Visibility from "enums/Visibility"
import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import type Book from "types/Book"
import type Like from "types/Like"
import type Save from "types/Save"

export default interface BookNote {
  id?: string
  creatorId: string
  bookId: string
  noteType: string
  text?: string
  title?: string
  linkUrl?: string
  createdAt: Date
  updatedAt: Date
  creator?: UserProfile
  book?: Book
  likeCount?: number
  visibility: Visibility
  currentUserLike?: Like // in-memory only
  creatorLikedBook?: boolean // in-memory only
  hasSpoilers: boolean
  save?: Save // in-memory only
}
