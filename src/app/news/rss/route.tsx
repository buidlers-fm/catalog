import { withApiHandling } from "lib/api/withApiHandling"

export const GET = withApiHandling(
  async () => {
    const ghostRssUrl = "https://catalogfyi.ghost.io/rss"
    const ghostRes = await fetch(ghostRssUrl)
    const rss = await ghostRes.text()

    return new Response(rss, {
      headers: { "Content-Type": "text/xml" },
    })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
