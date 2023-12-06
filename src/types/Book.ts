import type BookNote from "types/BookNote"

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
}
