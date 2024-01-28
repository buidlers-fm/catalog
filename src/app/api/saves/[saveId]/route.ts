import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params
    const { saveId } = routeParams

    const save = await prisma.interaction.findFirst({
      where: {
        id: saveId,
      },
    })

    if (save) {
      if (save.agentId !== userProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      await prisma.interaction.delete({
        where: {
          id: save.id,
        },
      })
    }

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
