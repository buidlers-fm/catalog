import type BookNote from "types/BookNote"
import type Like from "types/Like"

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
  likeCount?: number // in-memory only
  currentUserLike?: Like // in-memory only
}
