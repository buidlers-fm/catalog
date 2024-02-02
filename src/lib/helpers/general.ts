import humps from "humps"
import slugify from "slug"
import cryptoRandomString from "crypto-random-string"
import { validate as isValidUuid } from "uuid"
import prisma from "lib/prisma"
import { BASE_URLS_BY_ENV } from "lib/constants/urls"
import CommentParentType from "enums/CommentParentType"
import NotificationObjectType from "enums/NotificationObjectType"

export const fetchJson = async (url: string | URL, options: any = {}) => {
  const res = await fetch(url, options)

  if (res.status < 200 || res.status >= 300) {
    console.log(res)
    const resBody = await res.json()
    console.log(resBody)
    throw new Error(resBody.error)
  }

  const resBody = await res.json()
  return humps.camelizeKeys(resBody)
}

export const truncateString = (_str: string | undefined, maxChars: number) => {
  if (!_str) return ""

  // matches "[@foo](bar)"
  const atMentionPattern = /\[@([^\]]+)\]\((.*?)\)/g

  // replace all mentions with just the name
  let str = _str.replace(atMentionPattern, (match, p1) => `@${p1}`)

  // matches "[foo](bar)"
  const linkPattern = /\[([^\]]+)\]\((.*?)\)/g

  // replace all links with just the text
  str = str.replace(linkPattern, (match, p1) => p1)

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

export const getBookEditLink = (slug: string) => `/books/${slug}/edit`

export const getBookEditLinkWithQueryString = (queryString: any) => `/books/edit?${queryString}`

export const getBookEditCoversLink = (slug: string) => `/books/${slug}/edit/covers`

export const getBookListsLink = (slug: string) => `/books/${slug}/lists`

export const getListLink = (userProfile, slug: string) =>
  `/users/${userProfile.username}/lists/${slug}`

export const getNewListLink = (userProfile) => `${getUserListsLink(userProfile.username)}/new`

export const getEditListLink = (userProfile, slug: string) =>
  `${getListLink(userProfile, slug)}/edit`

export const getUserBookNotesLink = (username: string) => `/users/${username}/notes`

export const getBookNotesLink = (slug: string) => `/books/${slug}/notes`

export const getBookPostsLink = (slug: string) => `/books/${slug}/posts`

export const getPostLink = (postId: string) => `/posts/${postId}`

export const getNoteLink = (noteId: string) => `/notes/${noteId}`

export const getUserFollowersLink = (username: string) => `/users/${username}/followers`

export const getUserFollowingLink = (username: string) => `/users/${username}/following`

export const getUserShelvesLink = (username: string) => `/users/${username}/shelves`

export const getUserEditsLink = (username: string) => `/users/${username}/edits`

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

export const getBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_CATALOG_ENV!
  return BASE_URLS_BY_ENV[env]
}

// make it noon UTC so that all users view it as the same date
export const dateStringToDateTime = (dateStr) => new Date(`${dateStr}T12:00:00Z`)

export const todayNoonUtc = () => {
  const dateString = new Date().toISOString().substring(0, 10)
  return dateStringToDateTime(dateString)
}

export const runInSequence = async (promises) => {
  for (const promise of promises) {
    await promise()
  }
}

export async function fetchImageAsBlob(url) {
  const response = await fetch(url)
  const blob = await response.blob()

  const mimeType = blob.type

  return {
    blob,
    mimeType,
  }
}

export function idsToObjects(objects) {
  // assumes object has an id field
  return objects.reduce((result, object) => ({ ...result, [object.id]: object }), {})
}

export function getAllAtMentions(text: string) {
  if (!text) return []

  // matches "[@foo](bar)"
  const regex = /\[@([^\]]+)\]\((.*?)\)/g

  const _matches: any[] = Array.from(text.matchAll(regex))

  let matches = _matches
    .map((match) => {
      const username = match[1] as string
      const potentialUuid = match[2] as string

      if (isValidUuid(potentialUuid)) {
        return { username, id: potentialUuid }
      } else {
        return null
      }
    })
    .filter(Boolean)

  // de-dupe by id
  matches = matches.filter(
    (match, index) => matches.findIndex((m) => m!.id === match!.id) === index,
  )

  return matches
}

export function commentParentTypeToNotificationObjectType(parentType: string) {
  const specialMappings = {
    [CommentParentType.Note]: NotificationObjectType.BookNote,
    [CommentParentType.Post]: NotificationObjectType.BookNote,
  }

  return specialMappings[parentType] || parentType
}

export function joinStringsWithAnd(strings) {
  const { length } = strings

  switch (length) {
    case 0:
      return ""
    case 1:
      return strings[0]
    case 2:
      return strings.join(" and ")
    default:
      return `${strings.slice(0, length - 1).join(", ")}, and ${strings[length - 1]}`
  }
}
