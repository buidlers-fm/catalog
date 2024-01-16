import humps from "humps"
import prisma from "lib/prisma"
import { reportToSentry } from "lib/sentry"
import InteractionObjectType from "enums/InteractionObjectType"
import NotificationType from "enums/NotificationType"
import NotificationAgentType from "enums/NotificationAgentType"
import NotificationObjectType from "enums/NotificationObjectType"
import NotificationSourceType from "enums/NotificationSourceType"

async function createNotifFromLike(likeInteraction) {
  const {
    id: likeId,
    agentId,
    objectId: likedObjectId,
    objectType: likedObjectType,
  } = likeInteraction

  if (!Object.values(NotificationObjectType).includes(likedObjectType)) {
    reportToSentry(new Error("Invalid liked object type"), {
      likeInteraction,
    })
    return
  }

  let notifiedUserProfileId

  if (
    likedObjectType === InteractionObjectType.BookNote ||
    likedObjectType === InteractionObjectType.List
  ) {
    const modelName = humps.camelize(likedObjectType)

    // @ts-ignore dynamic model name
    const likedObject = await prisma[modelName].findFirst({
      where: {
        id: likedObjectId,
      },
    })

    if (likedObject) {
      notifiedUserProfileId = likedObject.creatorId
    } else {
      reportToSentry(new Error("Liked object not found, can't create notif"), {
        likeInteraction,
      })
    }
  } else if (likedObjectType === InteractionObjectType.Comment) {
    const comment = await prisma.comment.findFirst({
      where: {
        id: likedObjectId,
      },
    })

    if (comment) {
      notifiedUserProfileId = comment.commenterId
    } else {
      reportToSentry(new Error("Comment not found, can't create notif"), {
        likeInteraction,
      })
    }
  }

  if (notifiedUserProfileId) {
    const notifData = {
      agentId,
      agentType: NotificationAgentType.User,
      type: NotificationType.Like,
      objectId: likedObjectId,
      objectType: likedObjectType, // assuming this has been confirmed a valid NotificationObjectType
      sourceId: likeId,
      sourceType: NotificationSourceType.Interaction,
      notifiedUserProfileId,
    }

    try {
      await prisma.notification.create({
        data: notifData,
      })
    } catch (error: any) {
      reportToSentry(error, notifData)
    }
  }
}

export { createNotifFromLike }
