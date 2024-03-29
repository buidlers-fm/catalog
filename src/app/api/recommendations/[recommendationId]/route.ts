import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile } = params
  const { recommendationId } = routeParams

  const { status } = reqJson

  const recommendation = await prisma.recommendation.findFirst({
    where: {
      id: recommendationId,
    },
  })

  if (!recommendation) {
    return NextResponse.json({ error: "Recommendation not found" }, { status: 404 })
  }

  // ensure user is recipient
  if (recommendation.recipientId !== currentUserProfile.id) {
    return NextResponse.json(
      { error: "User must be the recipient of this recommendation" },
      { status: 403 },
    )
  }

  const updatedRec = await prisma.recommendation.update({
    where: {
      id: recommendationId,
    },
    data: {
      status,
    },
  })

  const resBody = humps.decamelizeKeys(updatedRec)

  return NextResponse.json(resBody, { status: 200 })
})
