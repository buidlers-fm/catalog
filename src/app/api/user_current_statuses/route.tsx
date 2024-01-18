import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { findOrCreateBook } from "lib/api/books"
import { getAllAtMentions } from "lib/helpers/general"
import { createNotifsFromMentions } from "lib/server/notifs"
import { reportToSentry } from "lib/sentry"
import NotificationObjectType from "enums/NotificationObjectType"
import type Mention from "types/Mention"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { book: _book, text } = reqJson

  let book = _book
  let bookId = _book?.id
  let connectBookParams

  if (book) {
    if (!bookId) {
      const dbBook = await findOrCreateBook(_book)
      bookId = dbBook.id
      book = dbBook
    }

    connectBookParams = {
      connect: {
        id: bookId,
      },
    }
  }

  const existingUserCurrentStatusIds = (
    await prisma.userCurrentStatus.findMany({
      where: {
        userProfileId: userProfile.id,
      },
    })
  ).map((userCurrentStatus) => userCurrentStatus.id)

  const deleteExistingUserCurrentStatuses = prisma.userCurrentStatus.deleteMany({
    where: {
      userProfileId: userProfile.id,
    },
  })

  const createUserCurrentStatus = prisma.userCurrentStatus.create({
    data: {
      text,
      userProfile: {
        connect: {
          id: userProfile.id,
        },
      },
      book: connectBookParams,
    },
  })

  const [, createdUserCurrentStatus] = await prisma.$transaction([
    deleteExistingUserCurrentStatuses,
    createUserCurrentStatus,
  ])

  try {
    await prisma.interaction.deleteMany({
      where: {
        objectId: {
          in: existingUserCurrentStatusIds,
        },
        objectType: NotificationObjectType.UserCurrentStatus,
      },
    })
  } catch (error: any) {
    reportToSentry(error, {
      existingUserCurrentStatusIds,
      method: "delete_likes_for_current_statuses",
    })
  }

  const atMentions = getAllAtMentions(text)

  const mentions: Mention[] = atMentions.map((atMention) => ({
    agentId: userProfile.id,
    objectId: createdUserCurrentStatus.id,
    objectType: NotificationObjectType.UserCurrentStatus,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  const responseData = {
    ...createdUserCurrentStatus,
    book,
  }

  const resBody = humps.decamelizeKeys(responseData)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile: userProfile } = params

    const existingUserCurrentStatusIds = (
      await prisma.userCurrentStatus.findMany({
        where: {
          userProfileId: userProfile.id,
        },
      })
    ).map((userCurrentStatus) => userCurrentStatus.id)

    await prisma.userCurrentStatus.deleteMany({
      where: {
        userProfileId: userProfile.id,
      },
    })

    try {
      await prisma.interaction.deleteMany({
        where: {
          objectId: {
            in: existingUserCurrentStatusIds,
          },
          objectType: NotificationObjectType.UserCurrentStatus,
        },
      })
    } catch (error: any) {
      reportToSentry(error, {
        existingUserCurrentStatusIds,
        method: "delete_likes_for_current_statuses",
      })
    }

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
