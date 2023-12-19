import humps from "humps"
import slugify from "slug"
import cryptoRandomString from "crypto-random-string"
import prisma from "lib/prisma"

export const fetchJson = async (url: string | URL, options: any = {}) => {
  const res = await fetch(url, options)

  if (res.status !== 200) {
    console.log(res)
    const resBody = await res.json()
    console.log(resBody)
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

export const getDomainFromUrl = (url: string) => {
  const { hostname } = new URL(url)

  // remove "www."" if present
  return hostname.replace(/^www\./, "")
}

export const getUserProfileLink = (username: string) => `/users/${username}`

export const getUserListsLink = (username: string) => `/users/${username}/lists`

export const getBookLink = (slug: string) => `/books/${slug}`

export const getBookListsLink = (slug: string) => `/books/${slug}/lists`

export const getListLink = (userProfile, slug: string) =>
  `/users/${userProfile.username}/lists/${slug}`

export const getNewListLink = (userProfile) => `${getUserListsLink(userProfile.username)}/new`

export const getEditListLink = (userProfile, slug: string) =>
  `${getListLink(userProfile, slug)}/edit`

export const getUserBookNotesLink = (username: string) => `/users/${username}/notes`

export const getBookNotesLink = (slug: string) => `/books/${slug}/notes`

export const getBookPostsLink = (slug: string) => `/books/${slug}/posts`

export const getUserFollowersLink = (username: string) => `/users/${username}/followers`

export const getUserFollowingLink = (username: string) => `/users/${username}/following`

export const getUserShelvesLink = (username: string) => `/users/${username}/shelves`

export const generateUniqueSlug = async (str, modelName, additionalFilters = {}) => {
  const MAX_BASE_LENGTH = 72
  const simpleSlug = slugify(str).slice(0, MAX_BASE_LENGTH)
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

export const sortListsByPinSortOrder = (lists, pins) =>
  lists
    .filter((list) => !!pins.find((p) => p.pinnedObjectId === list.id))
    .sort((listA, listB) => {
      const pinA = pins.find((pin) => pin.pinnedObjectId === listA.id)
      const pinB = pins.find((pin) => pin.pinnedObjectId === listB.id)

      const orderA = pinA?.sortOrder || Infinity
      const orderB = pinB?.sortOrder || Infinity

      return orderA - orderB
    })

export const normalizeString = (str) => {
  let result = str
  const stringsToRemove = ["& ", "and "]

  stringsToRemove.forEach((toRemove) => {
    result = result.replace(new RegExp(toRemove, "g"), "")
  })

  result = stripPunctuation(result)

  return result
}

export const isSameLanguage = (_a: string, _b: string) => {
  const a = normalizeString(_a)
  const b = normalizeString(_b)
  return (
    a.localeCompare(b, undefined, {
      usage: "search",
      sensitivity: "base",
      ignorePunctuation: true,
    }) === 0
  )
}

export const stripPunctuation = (str) => str.replace(/[^\w\s]|_/g, "")

// identical implementations for now, but could diverge later
export const looseStringEquals = isSameLanguage

export const isDevelopment = () => process.env.NEXT_PUBLIC_CATALOG_ENV === "development"

export const isPreview = () => process.env.NEXT_PUBLIC_CATALOG_ENV === "preview"

export const isStaging = () => process.env.NEXT_PUBLIC_CATALOG_ENV === "staging"

export const isProduction = () => process.env.NEXT_PUBLIC_CATALOG_ENV === "production"

// make it noon UTC so that all users view it as the same date
export const dateStringToDateTime = (dateStr) => new Date(`${dateStr}T12:00:00Z`)

export const todayNoonUtc = () => {
  const dateString = new Date().toISOString().substring(0, 10)
  return dateStringToDateTime(dateString)
}
