import { Book as DbBook } from "@prisma/client"
import type Book from "types/Book"
import type UserProfile from "types/UserProfile"

export default interface List {
  id?: string
  slug?: string
  title: string
  description?: string
  creatorId: string
  creator: UserProfile
  ownerId: string
  owner: UserProfile
  listItemAssignments: any[] // TODO
  createdAt?: Date
  books: Book[]
  dbBooks: DbBook[]
}
