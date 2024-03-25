import { NextResponse } from "next/server"
import humps from "humps"
import { withApiHandling } from "lib/api/withApiHandling"
import { getCurrentUserProfile } from "lib/server/auth"
import { searchUsers } from "lib/server/search"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (req: NextRequest) => {
    const { searchParams } = req.nextUrl

    const searchStr = searchParams.get("query")
    const followers = searchParams.get("followers") === "true"

    const currentUserProfile = await getCurrentUserProfile()

    const options = {
      followersOnly: followers,
      currentUserProfile,
    }

    const results = await searchUsers(searchStr, options)

    const resBody = humps.decamelizeKeys(results)

    return NextResponse.json(resBody, { status: 200 })
  },
  {
    requireJsonBody: false,
  },
)
