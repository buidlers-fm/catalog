import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import RecommendationStatus from "enums/RecommendationStatus"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params

    await prisma.recommendation.updateMany({
      where: {
        recipientId: currentUserProfile.id,
        status: RecommendationStatus.New,
      },
      data: {
        status: RecommendationStatus.Open,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
