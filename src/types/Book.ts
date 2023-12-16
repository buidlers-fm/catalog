import type BookNote from "types/BookNote"
import type Like from "types/Like"
import type UserBookShelfAssignment from "types/UserBookShelfAssignment"

export default interface Book {
  id?: string
  slug?: string
  title: string
  subtitle?: string
  authorName: string
  description?: string
  coverImageUrl: string
  editionsCount?: number
  firstPublishedYear?: number | string
  openLibraryWorkId: string
  isTranslated?: boolean
  originalTitle?: string
  openLibraryBestEditionId?: string // in-memory only
  bookNotes?: BookNote[]
  bookPosts?: BookNote[]
  bookReads?: any[] // TODO
  userBookShelfAssignments?: UserBookShelfAssignment[]
  likeCount?: number // in-memory only
  currentUserLike?: Like // in-memory only
}
