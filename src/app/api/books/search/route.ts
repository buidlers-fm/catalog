import { NextResponse } from "next/server"
import humps from "humps"
import { withApiHandling } from "lib/api/withApiHandling"
import { searchExistingBooks } from "lib/server/search"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (req: NextRequest) => {
    const { searchParams } = req.nextUrl

    const searchStr = searchParams.get("query")

    const results = await searchExistingBooks(searchStr)

    const resBody = humps.decamelizeKeys(results)

    return NextResponse.json(resBody, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
    requireJsonBody: false,
  },
)
