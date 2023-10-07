import humps from "humps"
import slugify from "slug"
import cryptoRandomString from "crypto-random-string"
import { PrismaClient } from "@prisma/client"
import type { Book as DbBook } from "@prisma/client"
import type Book from "types/Book"

const prisma = new PrismaClient()

export const fetchJson = async (url: string | URL, options: any = {}) => {
  const res = await fetch(url, options)

  if (res.status !== 200) {
    console.log(res)
    const resBody = await res.json()
    throw new Error(resBody.error)
  }

  const resBody = await res.json()
  return humps.camelizeKeys(resBody)
}

export const truncateString = (str: string | undefined, maxChars: number) => {
  if (!str) return ""
  if (str.length <= maxChars) return str

  const lastSpaceIndex = str.lastIndexOf(" ", maxChars)
  const truncatedString = str.substring(0, lastSpaceIndex).trim()

  return `${truncatedString}...`
}

export const isValidHttpUrl = (string) => {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:"
}

export const getUserProfileLink = (username: string) => `/users/${username}`

export const getBookLink = (slug: string) => `/books/${slug}`

export const getListLink = (user, slug: string) => `/users/${user.username}/lists/${slug}`

export const getEditListLink = (user, slug: string) => `${getListLink(user, slug)}/edit`

export const dbBookToBook = (dbBook: DbBook): Book => ({
  title: dbBook.title,
  by: dbBook.authorName!,
  coverImageUrl: dbBook.coverImageUrl!,
  openlibraryWorkId: dbBook.openlibraryWorkId!,
})

export const generateUniqueSlug = async (str, modelName, additionalFilters = {}) => {
  const simpleSlug = slugify(str)
  const simpleSlugFilters = { slug: simpleSlug, ...additionalFilters }
  const isSimpleSlugAvailable = !(await (prisma[modelName] as any).findFirst({
    where: simpleSlugFilters,
  }))

  if (isSimpleSlugAvailable) return simpleSlug

  let slug
  let isSlugTaken = true

  /* eslint-disable no-await-in-loop */
  while (isSlugTaken) {
    const randomString = cryptoRandomString({ length: 6 })
    slug = `${simpleSlug}-${randomString}`
    const filters = { slug, ...additionalFilters }
    isSlugTaken = !!(await (prisma[modelName] as any).findFirst({ where: filters }))
  }

  return slug
}
