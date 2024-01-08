import GhostContentApi from "@tryghost/content-api"
import GhostAdminApi from "@tryghost/admin-api"

const GHOST_URL = process.env.GHOST_URL!
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY!
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY!

const contentApi = new GhostContentApi({
  url: GHOST_URL,
  key: GHOST_CONTENT_API_KEY,
  version: "v5.0",
})

const adminApi = new GhostAdminApi({
  url: GHOST_URL,
  key: GHOST_ADMIN_API_KEY,
  version: "v5.0",
})

async function getAllPosts() {
  const posts = await contentApi.posts.browse({ include: "authors" })
  return posts
}

async function getPost(slug: string) {
  try {
    const post = await contentApi.posts.read(
      { slug },
      { include: "authors", formats: ["html", "plaintext"] },
    )
    return post
  } catch (error: any) {
    const ERRORS_TO_IGNORE = [/ValidationError/, /NotFoundError/]

    if (ERRORS_TO_IGNORE.some((e) => error.message.match(e))) {
      return null
    }
  }
}

async function subscribe(email: string) {
  const member = await adminApi.members.add({ email })
  return member
}

export { getAllPosts, getPost, subscribe }
