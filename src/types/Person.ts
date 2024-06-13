import type Book from "types/Book"

export default interface Person {
  id: string
  slug: string
  name: string
  imageUrl?: string
  bio?: string
  wikipdiaUrl?: string
  location?: string
  website?: string
  openLibraryAuthorId?: string
  wikidataId?: string
  edited: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  books?: Book[]
}
