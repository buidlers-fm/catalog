import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { findOrCreateBook } from "lib/api/books"
import InteractionType from "enums/InteractionType"
import RecommendationRecipientType from "enums/RecommendationRecipientType"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const status = queryParams.get("status") || undefined

    const notifs = await prisma.recommendation.findMany({
      where: {
        recipientId: currentUserProfile.id,
        status,
      },
      include: {
        book: true,
        recommender: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const resBody = humps.decamelizeKeys(notifs)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { currentUserProfile, reqJson } = params

  const { book, recipientId, note } = reqJson

  let bookId = book.id
  if (!bookId) {
    const dbBook = await findOrCreateBook(book)
    bookId = dbBook.id
  }

  // ensure recipient is a follower
  const follow = await prisma.interaction.findFirst({
    where: {
      agentId: recipientId,
      objectId: currentUserProfile.id,
      interactionType: InteractionType.Follow,
    },
  })

  if (!follow) {
    return NextResponse.json({ error: "Recipient must be a follower" }, { status: 400 })
  }

  const createdRec = await prisma.recommendation.create({
    data: {
      recommenderId: currentUserProfile.id,
      bookId,
      recipientId,
      recipientType: RecommendationRecipientType.User,
      note: note || undefined,
    },
  })

  const resBody = humps.decamelizeKeys(createdRec)

  return NextResponse.json(resBody, { status: 200 })
})
