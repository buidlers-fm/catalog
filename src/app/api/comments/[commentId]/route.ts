import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { createNotifsFromMentions } from "lib/server/notifs"
import { getAllAtMentions, commentParentTypeToNotificationObjectType } from "lib/helpers/general"
import { decorateComments } from "lib/server/decorators"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import NotificationType from "enums/NotificationType"
import NotificationSourceType from "enums/NotificationSourceType"
import NotificationObjectType from "enums/NotificationObjectType"
import InteractionObjectType from "enums/InteractionObjectType"
import type Mention from "types/Mention"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile } = params
    const { commentId } = routeParams

    let comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    ;[comment] = await decorateComments([comment], currentUserProfile)

    const resBody = humps.decamelizeKeys(comment)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false },
)

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile: userProfile } = params
  const { commentId } = routeParams

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
    },
  })

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  if (comment?.commenterId !== userProfile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { text } = reqJson

  const updatedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      text,
    },
  })

  // create notifications
  const { parentId, parentType } = comment

  const atMentions = getAllAtMentions(text)

  const existingNotifs = await prisma.notification.findMany({
    where: {
      agentId: userProfile.id,
      objectId: parentId,
      objectType: commentParentTypeToNotificationObjectType(parentType),
      sourceId: commentId,
      sourceType: NotificationSourceType.Comment,
      type: NotificationType.Mention,
      notifiedUserProfileId: {
        in: atMentions.map((atMention) => atMention!.id),
      },
    },
  })

  const newAtMentions = atMentions.filter(
    (atMention) => !existingNotifs.find((n) => n.notifiedUserProfileId === atMention!.id),
  )

  const mentions: Mention[] = newAtMentions.map((atMention) => ({
    agentId: userProfile.id,
    objectId: parentId,
    objectType: commentParentTypeToNotificationObjectType(parentType),
    sourceId: commentId,
    sourceType: NotificationSourceType.Comment,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  // return response
  const resBody = humps.decamelizeKeys(updatedComment)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params
    const { commentId } = routeParams

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (comment?.commenterId !== userProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    })

    try {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            {
              objectId: commentId,
              objectType: NotificationObjectType.Comment,
            },
            {
              sourceId: commentId,
              sourceType: NotificationSourceType.Comment,
            },
          ],
        },
      })

      await prisma.interaction.deleteMany({
        where: {
          objectId: commentId,
          objectType: InteractionObjectType.Comment,
        },
      })
    } catch (error: any) {
      reportToSentry(error, {
        method: "api.comments.delete.delete_associated_objects",
        commentId,
      })
    }

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
