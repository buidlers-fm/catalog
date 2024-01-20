import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile } = params
    const { waitlisterId } = routeParams

    const waitlister = await prisma.waitlister.findFirst({
      where: {
        id: waitlisterId,
      },
    })

    if (!waitlister) {
      return NextResponse.json({ error: "Waitlister not found" }, { status: 404 })
    }

    const updatedWaitlister = await prisma.waitlister.update({
      where: {
        id: waitlisterId,
      },
      data: {
        invitedAt: new Date(),
        invitedByUserProfileId: currentUserProfile.id,
      },
    })

    const resBody = humps.decamelizeKeys(updatedWaitlister)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireAdmin: true },
)
