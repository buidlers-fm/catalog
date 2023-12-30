import GhostContentApi from "@tryghost/content-api"

const GHOST_URL = process.env.GHOST_URL!
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY!

const api = new GhostContentApi({
  url: GHOST_URL,
  key: GHOST_CONTENT_API_KEY,
  version: "v5.0",
})

async function getAllPosts() {
  const posts = await api.posts.browse({ include: "authors" })
  return posts
}

async function getPost(slug: string) {
  const post = await api.posts.read(
    { slug },
    { include: "authors", formats: ["html", "plaintext"] },
  )
  return post
}

export { getAllPosts, getPost }
