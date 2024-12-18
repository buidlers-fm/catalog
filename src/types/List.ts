import type Book from "types/Book"
import type { UserProfileProps } from "lib/models/UserProfile"
import type Comment from "types/Comment"
import type Save from "types/Save"

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
  comments?: Comment[]
  createdAt?: Date
  updatedAt?: Date
  books?: Book[]
  ranked: boolean
  likeCount?: number // in-memory only
  currentUserLike?: any // in-memory only
  save?: Save // in-memory only
}
