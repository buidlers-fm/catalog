import { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import EditedObjectType from "enums/EditedObjectType"
import EditType from "enums/EditType"

export default interface EditLog {
  id: string
  editorId: string
  editedObjectId: string
  editedObjectType: EditedObjectType
  editType: EditType
  beforeJson: any
  afterJson: any
  editedFields: string[]
  createdAt: Date
  editor: UserProfile
  editedObject: any // Book | Person, in-memory only
}
