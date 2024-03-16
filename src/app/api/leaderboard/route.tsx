import { NextResponse } from "next/server"
import humps from "humps"
import { withApiHandling } from "lib/api/withApiHandling"
import { getUserProfilesByDistinctBooksEdited } from "lib/server/leaderboard"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const limit = _req.nextUrl.searchParams.get("limit")
      ? Number(_req.nextUrl.searchParams.get("limit"))
      : undefined

    const results = await getUserProfilesByDistinctBooksEdited(limit)

    const resBody = humps.decamelizeKeys(results)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
