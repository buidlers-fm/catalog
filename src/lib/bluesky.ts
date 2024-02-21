import { BskyAgent } from "@atproto/api"

const agent = new BskyAgent({
  service: "https://public.api.bsky.app",
})

const Bluesky = {
  agent,

  getFeed: async (uri: string, limit: number = 50) => {
    const { data } = await agent.app.bsky.feed.getFeed(
      {
        feed: uri,
        limit,
      },
      {
        headers: {
          "Accept-Language": "en",
        },
      },
    )

    const { feed: items } = data

    return items.map((item) => item.post)
  },
}

export default Bluesky
