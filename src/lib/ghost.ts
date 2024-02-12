import GhostAdminApi from "@tryghost/admin-api"
import { fetchJson } from "lib/helpers/general"

const GHOST_URL = process.env.GHOST_URL!
const GHOST_CONTENT_API_BASE_URL = `${GHOST_URL}/ghost/api/content/`
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY!
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY!

const headers = {
  "Accept-Version": "v5.0",
}

const adminApi = new GhostAdminApi({
  url: GHOST_URL,
  key: GHOST_ADMIN_API_KEY,
  version: "v5.0",
})

async function getAllPosts() {
  const url = `${GHOST_CONTENT_API_BASE_URL}posts?key=${GHOST_CONTENT_API_KEY}&include=authors`

  const { posts } = await fetchJson(url, {
    headers,
  })

  return posts
}

async function getPost(slug: string) {
  try {
    const url = `${GHOST_CONTENT_API_BASE_URL}posts/slug/${slug}?key=${GHOST_CONTENT_API_KEY}&include=authors&formats=html,plaintext`

    const { posts } = await fetchJson(url, {
      headers,
    })

    return posts?.[0]
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
