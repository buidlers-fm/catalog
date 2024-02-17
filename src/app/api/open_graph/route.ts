import { NextResponse } from "next/server"
import humps from "humps"
import ogs from "open-graph-scraper"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const queryParams = _req.nextUrl.searchParams
    const url = queryParams.get("url")

    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 })

    const { error, result } = await ogs({ url })

    if (error) return NextResponse.json({ error }, { status: 400 })

    const { ogTitle, ogImage: ogImages } = result

    const resData = {
      title: ogTitle,
      imageUrl: ogImages?.[0]?.url,
    }

    const resBody = humps.decamelizeKeys(resData)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
