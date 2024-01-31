import CommentParentType from "enums/CommentParentType"
import type Like from "types/Like"

export default interface Comment {
  id?: string
  text: string
  depth: number
  parentId: string
  parentType: CommentParentType
  rootObjectId: string
  rootObjectType: CommentParentType
  commenterId: string
  commenterType: string
  createdAt?: string | Date
  updatedAt?: string | Date
  commenter?: any
  parent?: any
  likeCount?: number
  currentUserLike?: Like // in-memory only
  saveId?: string // in-memory only
}
