import prisma from "lib/prisma"
import { reportToSentry } from "lib/sentry"
import { commentParentTypeToNotificationObjectType } from "lib/helpers/general"
import NotificationType from "enums/NotificationType"
import NotificationAgentType from "enums/NotificationAgentType"
import NotificationObjectType from "enums/NotificationObjectType"
import NotificationSourceType from "enums/NotificationSourceType"
import type Mention from "types/Mention"

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

  if (objectType === NotificationObjectType.List) {
    const object = await prisma.list.findFirst({
      where: {
        id: objectId,
      },
    })

    if (object) {
      notifiedUserProfileId = object.creatorId
    } else {
      reportToSentry(new Error(`List not found, can't create notif`), {
        source,
      })
      return
    }
  } else if (objectType === NotificationObjectType.BookNote) {
    const object = await prisma.bookNote.findFirst({
      where: {
        id: objectId,
      },
    })

    if (object) {
      notifiedUserProfileId = object.creatorId
    } else {
      reportToSentry(new Error(`Note or post not found, can't create notif`), {
        source,
      })
      return
    }
  } else if (objectType === NotificationObjectType.Comment) {
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
      return
    }
  } else if (objectType === NotificationObjectType.UserCurrentStatus) {
    const userCurrentStatus = await prisma.userCurrentStatus.findFirst({
      where: {
        id: objectId,
      },
    })

    if (userCurrentStatus) {
      notifiedUserProfileId = userCurrentStatus.userProfileId
    } else {
      reportToSentry(new Error("User current status not found, can't create notif"), {
        source,
      })
      return
    }
  }

  if (!notifiedUserProfileId) {
    reportToSentry(new Error("Notified user profile id not found, can't create notif"), {
      source,
    })
    return
  }

  if (agentId === notifiedUserProfileId) return

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

  const existingNotif = await prisma.notification.findFirst({
    where: notifData,
  })

  if (existingNotif) return

  try {
    await prisma.notification.create({
      data: notifData,
    })
  } catch (error: any) {
    reportToSentry(error, notifData)
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
    objectType: commentParentTypeToNotificationObjectType(parentType),
    notificationType: NotificationType.Comment,
    sourceType: NotificationSourceType.Comment,
  })
}

async function createNotifsFromMentions(mentions: Mention[]) {
  const notifsData = mentions
    .map((mention) => {
      const { agentId, objectId, objectType, sourceId, sourceType, mentionedUserProfileId } =
        mention

      return {
        agentId,
        agentType: NotificationAgentType.User,
        type: NotificationType.Mention,
        objectId,
        objectType,
        sourceId,
        sourceType,
        notifiedUserProfileId: mentionedUserProfileId,
      }
    })
    .filter((notifData) => notifData.agentId !== notifData.notifiedUserProfileId)

  try {
    await prisma.notification.createMany({
      data: notifsData,
    })
  } catch (error: any) {
    reportToSentry(error, notifsData)
  }
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

export {
  createNotifFromLike,
  createNotifFromComment,
  createNotifsFromMentions,
  markAsRead,
  markAllAsRead,
}
