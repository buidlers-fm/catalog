import { NextResponse } from "next/server"
import humps from "humps"
import { getCurrentUserProfile } from "lib/server/auth"
import { withApiHandling } from "lib/api/withApiHandling"

export const GET = withApiHandling(
  async () => {
    const currentUserProfile = await getCurrentUserProfile()

    const resBody = humps.decamelizeKeys(currentUserProfile)

    return NextResponse.json(resBody, { status: 200 })
  },
  {
    requireJsonBody: false,
  },
)
