import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { getAllAtMentions } from "lib/helpers/general"
import { createNotifsFromMentions } from "lib/server/notifs"
import { withApiHandling } from "lib/api/withApiHandling"
import NotificationType from "enums/NotificationType"
import NotificationObjectType from "enums/NotificationObjectType"
import type Mention from "types/Mention"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile: userProfile } = params
  const { bookNoteId } = routeParams

  const bookNote = await prisma.bookNote.findFirst({
    where: {
      id: bookNoteId,
    },
  })

  if (!bookNote) {
    return NextResponse.json({ error: "Book note not found" }, { status: 404 })
  }

  if (bookNote?.creatorId !== userProfile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { title, text, hasSpoilers } = reqJson

  const updatedBookNote = await prisma.bookNote.update({
    where: {
      id: bookNoteId,
    },
    data: {
      title,
      text,
      hasSpoilers,
    },
  })

  // create notifications
  const atMentions = getAllAtMentions(text)

  const existingNotifs = await prisma.notification.findMany({
    where: {
      agentId: userProfile.id,
      objectId: updatedBookNote.id,
      objectType: NotificationObjectType.BookNote,
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
    objectId: updatedBookNote.id,
    objectType: NotificationObjectType.BookNote,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  const resBody = humps.decamelizeKeys(updatedBookNote)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params
    const { bookNoteId } = routeParams

    const bookNote = await prisma.bookNote.findFirst({
      where: {
        id: bookNoteId,
      },
    })

    if (!bookNote) {
      return NextResponse.json({ error: "Book note not found" }, { status: 404 })
    }

    if (bookNote?.creatorId !== userProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.bookNote.delete({
      where: {
        id: bookNoteId,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
