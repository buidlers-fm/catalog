import type BookNote from "types/BookNote"
import type Like from "types/Like"
import type UserBookShelfAssignment from "types/UserBookShelfAssignment"
import type Adaptation from "types/Adaptation"
import type Person from "types/Person"
import type PersonBookRelation from "types/PersonBookRelation"

export default interface Book {
  id?: string
  slug?: string
  title: string
  subtitle?: string
  authorName: string
  description?: string
  coverImageUrl?: string
  coverImageThumbnailUrl?: string
  openLibraryCoverImageUrl?: string
  editionsCount?: number
  firstPublishedYear?: number | string
  openLibraryWorkId: string
  openLibraryAuthorId?: string
  isTranslated?: boolean
  originalTitle?: string
  wikipediaUrl?: string
  edited?: boolean
  author?: Person
  bookNotes?: BookNote[]
  bookPosts?: BookNote[]
  bookReads?: any[] // TODO
  userShelfAssignments?: UserBookShelfAssignment[]
  adaptations?: Adaptation[]
  personBookRelations?: PersonBookRelation[]
  openLibraryBestEditionId?: string // in-memory only
  isbn?: string // in-memory only
  oclc?: string // in-memory only
  likeCount?: number // in-memory only
  currentUserLike?: Like // in-memory only
  totalShelfCounts?: any // in-memory only
  totalFavoritedCount?: number // in-memory only
  shelvesToFriendsProfiles?: any // in-memory only
  likedByFriendsProfiles?: any[] // in-memory only
  favoritedByFriendsProfiles?: any[] // in-memory only
}
