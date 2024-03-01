import { BskyAgent } from "@atproto/api"
import { reportToSentry } from "lib/sentry"

const agent = new BskyAgent({
  service: "https://public.api.bsky.app",
})

const Bluesky = {
  agent,

  getFeed: async (uri: string, options: any = {}) => {
    const { limit = 10, nextPage: cursor } = options

    try {
      const { data } = await agent.app.bsky.feed.getFeed(
        {
          feed: uri,
          limit,
          cursor,
        },
        {
          headers: {
            "Accept-Language": "en",
          },
        },
      )

      const { feed: items, cursor: nextPage } = data

      return {
        posts: items.map((item) => item.post),
        nextPage,
      }
    } catch (error: any) {
      reportToSentry(error, {
        method: "Bluesky.getFeed",
        uri,
      })

      return {
        posts: [],
      }
    }
  },
}

export default Bluesky
