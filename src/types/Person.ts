import type PersonBookRelation from "types/PersonBookRelation"
import type Book from "types/Book"

export default interface Person {
  id: string
  slug: string
  name: string
  imageUrl?: string
  orgName?: string
  title?: string
  bio?: string
  wikipdiaUrl?: string
  location?: string
  website?: string
  instagram?: string
  tiktok?: string
  bluesky?: string
  twitter?: string
  openLibraryAuthorId?: string
  wikidataId?: string
  edited: boolean
  areBooksEdited: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  personBookRelations?: PersonBookRelation[]
  books?: Book[]
  openLibraryBooks?: Book[] // only used in the edit books page
  authoredBooks?: Book[] // in-memory only
  creditsByRelationType?: any[] // in-memory only
}
