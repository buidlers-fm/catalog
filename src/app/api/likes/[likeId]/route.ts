import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params
    const { likeId } = routeParams

    const like = await prisma.interaction.findFirst({
      where: {
        id: likeId,
      },
    })

    if (!like) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 })
    }

    if (like?.agentId !== userProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.interaction.delete({
      where: {
        id: likeId,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
