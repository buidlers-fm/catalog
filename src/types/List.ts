import type Book from "types/Book"
import type { UserProfileProps } from "lib/models/UserProfile"

export default interface List {
  id?: string
  slug?: string
  title: string
  description?: string | null
  creatorId: string
  creator?: UserProfileProps
  ownerId: string
  owner?: UserProfileProps
  listItemAssignments: any[] // TODO
  createdAt?: Date
  books?: Book[]
  ranked: boolean
}
