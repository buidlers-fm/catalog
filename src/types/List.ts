import type Book from "types/Book"
import type UserProfile from "types/UserProfile"

export default interface List {
  id?: string
  slug?: string
  title: string
  description?: string | null
  creatorId: string
  creator?: UserProfile
  ownerId: string
  owner?: UserProfile
  listItemAssignments: any[] // TODO
  createdAt?: Date
  books?: Book[]
  ranked: boolean
}
