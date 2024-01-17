import humps from "humps"
import prisma from "lib/prisma"
import { reportToSentry } from "lib/sentry"
import InteractionObjectType from "enums/InteractionObjectType"
import NotificationType from "enums/NotificationType"
import NotificationAgentType from "enums/NotificationAgentType"
import NotificationObjectType from "enums/NotificationObjectType"
import NotificationSourceType from "enums/NotificationSourceType"

async function createNotifFromSource(source) {
  const { id: sourceId, agentId, objectId, objectType, notificationType, sourceType } = source

  if (!Object.values(NotificationType).includes(notificationType)) {
    reportToSentry(new Error("Invalid notification type"), {
      source,
    })
    return
  }

  if (!Object.values(NotificationObjectType).includes(objectType)) {
    reportToSentry(new Error("Invalid object type"), {
      source,
    })
    return
  }

  if (!Object.values(NotificationSourceType).includes(sourceType)) {
    reportToSentry(new Error("Invalid source type"), {
      source,
    })
    return
  }

  let notifiedUserProfileId

  if (objectType === InteractionObjectType.BookNote || objectType === InteractionObjectType.List) {
    const modelName = humps.camelize(objectType)

    // @ts-ignore dynamic model name
    const object = await prisma[modelName].findFirst({
      where: {
        id: objectId,
      },
    })

    if (object) {
      notifiedUserProfileId = object.creatorId
    } else {
      reportToSentry(new Error(`${objectType} not found, can't create notif`), {
        source,
      })
    }
  } else if (objectType === InteractionObjectType.Comment) {
    const comment = await prisma.comment.findFirst({
      where: {
        id: objectId,
      },
    })

    if (comment) {
      notifiedUserProfileId = comment.commenterId
    } else {
      reportToSentry(new Error("Comment not found, can't create notif"), {
        source,
      })
    }
  }

  if (notifiedUserProfileId) {
    const notifData = {
      agentId,
      agentType: NotificationAgentType.User,
      type: notificationType,
      objectId,
      objectType,
      sourceId,
      sourceType,
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

async function createNotifFromLike(likeInteraction) {
  const { id, agentId, objectId, objectType } = likeInteraction

  return createNotifFromSource({
    id,
    agentId,
    objectId,
    objectType,
    notificationType: NotificationType.Like,
    sourceType: NotificationSourceType.Interaction,
  })
}

async function createNotifFromComment(comment) {
  const { id: commentId, commenterId, parentId, parentType } = comment

  return createNotifFromSource({
    id: commentId,
    agentId: commenterId,
    objectId: parentId,
    objectType: parentType,
    notificationType: NotificationType.Comment,
    sourceType: NotificationSourceType.Comment,
  })
}

async function markAsRead(notifs) {
  const notifIds = notifs.map((notif) => notif.id)

  await prisma.notification.updateMany({
    where: {
      id: {
        in: notifIds,
      },
    },
    data: {
      read: true,
    },
  })
}

async function markAllAsRead(notifiedUserProfileId) {
  await prisma.notification.updateMany({
    where: {
      notifiedUserProfileId,
    },
    data: {
      read: true,
    },
  })
}

export { createNotifFromLike, createNotifFromComment, markAsRead, markAllAsRead }
