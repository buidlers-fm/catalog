import { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import NotificationAgentType from "enums/NotificationAgentType"
import NotificationType from "enums/NotificationType"
import NotificationObjectType from "enums/NotificationObjectType"
import NotificationSourceType from "enums/NotificationSourceType"

export default interface Notification {
  id: string
  agentId: string
  agentType: NotificationAgentType
  type: NotificationType
  objectId: string
  objectType: NotificationObjectType
  sourceId: string
  sourceType: NotificationSourceType
  notifiedUserProfileId: string
  read: boolean
  createdAt: Date | string
  updatedAt: Date | string
  agent: UserProfile
  object: any
  source: any
  notifiedUser: UserProfile
}
