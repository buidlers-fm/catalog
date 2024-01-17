import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const read = queryParams.get("read") === "true"

    const notifs = await prisma.notification.findMany({
      where: {
        notifiedUserProfileId: currentUserProfile.id,
        read,
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
