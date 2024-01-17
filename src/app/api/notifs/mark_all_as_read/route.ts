import { NextResponse } from "next/server"
import { withApiHandling } from "lib/api/withApiHandling"
import { markAllAsRead } from "lib/server/notifs"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params

    await markAllAsRead(currentUserProfile.id)

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
