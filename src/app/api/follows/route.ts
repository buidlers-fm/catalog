import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params

  const { userProfileId } = reqJson

  const userProfile = await prisma.userProfile.findFirst({
    where: { id: userProfileId },
  })

  if (!userProfile) {
    const errorMsg = "User profile not found."
    return NextResponse.json({ error: errorMsg }, { status: 404 })
  }

  const followParams = {
    interactionType: InteractionType.Follow,
    objectId: userProfileId,
    objectType: InteractionObjectType.User,
    agentId: currentUserProfile.id,
    agentType: InteractionAgentType.User,
  }

  let follow = await prisma.interaction.findFirst({
    where: followParams,
  })

  if (!follow) {
    follow = await prisma.interaction.create({
      data: followParams,
    })
  }

  const resBody = humps.decamelizeKeys(follow)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const userProfileId = queryParams.get("user_profile_id") || undefined

    if (!userProfileId) {
      const errorMsg = "Must provide user_profile_id query param."
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    await prisma.interaction.deleteMany({
      where: {
        interactionType: InteractionType.Follow,
        objectId: userProfileId,
        objectType: InteractionObjectType.User,
        agentId: currentUserProfile.id,
        agentType: InteractionAgentType.User,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
