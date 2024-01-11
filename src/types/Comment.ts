import type Like from "types/Like"

export default interface Comment {
  id?: string
  text: string
  level: number
  parentId: string
  parentType: string
  commenterId: string
  commenterType: string
  createdAt?: string | Date
  updatedAt?: string | Date
  commenter?: any
  parent?: any
  likeCount?: number
  currentUserLike?: Like // in-memory only
}
