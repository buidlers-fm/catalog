import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { findOrCreateBook } from "lib/api/books"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const likedObjectId = queryParams.get("liked_object_id") || undefined
    const likedObjectType = queryParams.get("liked_object_type") || undefined
    const userProfileId = queryParams.get("user_profile_id") || undefined
    const compact = queryParams.get("compact") === "true"

    let responseData

    if (compact) {
      // fetch count instead of all like objects
      const likeCount = await prisma.interaction.count({
        where: {
          interactionType: InteractionType.Like,
          objectId: likedObjectId,
          objectType: likedObjectType,
          agentId: userProfileId,
          agentType: InteractionAgentType.User,
        },
      })

      let currentUserLike
      if (currentUserProfile) {
        currentUserLike = await prisma.interaction.findFirst({
          where: {
            interactionType: InteractionType.Like,
            objectId: likedObjectId,
            objectType: likedObjectType,
            agentId: currentUserProfile.id,
            agentType: InteractionAgentType.User,
          },
        })
      }

      responseData = {
        likeCount,
        currentUserLike,
      }
    } else {
      const likes = await prisma.interaction.findMany({
        where: {
          interactionType: InteractionType.Like,
          objectId: likedObjectId,
          objectType: likedObjectType,
          agentId: userProfileId,
          agentType: InteractionAgentType.User,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      let currentUserLike
      if (currentUserProfile) {
        currentUserLike = likes.find((like) => like.agentId === currentUserProfile.id)
      }

      responseData = {
        likes,
        likeCount: likes.length,
        currentUserLike,
      }
    }

    const resBody = humps.decamelizeKeys(responseData)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { likedObjectType, likedObject } = reqJson

  let likedObjectId = likedObject.id

  if (likedObjectType === InteractionObjectType.Book && !likedObjectId) {
    const dbBook = await findOrCreateBook(likedObject)
    likedObjectId = dbBook.id
  }

  const like = await prisma.interaction.create({
    data: {
      interactionType: InteractionType.Like,
      objectId: likedObjectId,
      objectType: likedObjectType,
      agentId: userProfile.id,
      agentType: InteractionAgentType.User,
    },
  })

  const resBody = humps.decamelizeKeys(like)

  return NextResponse.json(resBody, { status: 200 })
})
