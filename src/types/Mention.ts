import NotificationObjectType from "enums/NotificationObjectType"
import NotificationSourceType from "enums/NotificationSourceType"

// in-memory type only
export default interface Mention {
  agentId: string
  objectId: string
  objectType: NotificationObjectType
  sourceId?: string
  sourceType?: NotificationSourceType
  mentionedUserProfileId: string
}
