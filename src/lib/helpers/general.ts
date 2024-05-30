import humps from "humps"
import slugify from "slug"
import cryptoRandomString from "crypto-random-string"
import { validate as isValidUuid } from "uuid"
import prisma from "lib/prisma"
import { reportToSentry } from "lib/sentry"
import { BASE_URLS_BY_ENV } from "lib/constants/urls"
import { USER_AGENT_HEADERS } from "lib/constants/general"
import CommentParentType from "enums/CommentParentType"
import NotificationObjectType from "enums/NotificationObjectType"
import InteractionObjectType from "enums/InteractionObjectType"
import UserRole from "enums/UserRole"

export const fetchJson = async (url: string | URL, options: any = {}) => {
  const TIMEOUT = 10_000 // 10 seconds

  let res
  let resClone
  try {
    const fetchPromise = fetch(url, options)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), TIMEOUT)
    })

    res = await Promise.race([fetchPromise, timeoutPromise])

    // clone the response so we can read the body twice:
    // if the first try errors, the second is for reporting the error
    resClone = res.clone()

    if (res.status < 200 || res.status >= 300) {
      const resBody = await res.json()

      if (resBody.error) {
        throw new Error(resBody.error)
      } else {
        throw new Error(`Failed to fetch ${url}: ${res.status}`)
      }
    }

    const resBody = await res.json()
    return humps.camelizeKeys(resBody)
  } catch (error: any) {
    reportToSentry(error, {
      url: url.toString(),
      options,
      res,
      resBody: await resClone?.text(),
    })

    throw error
  }
}

export const fetchJsonWithUserAgentHeaders = async (url: string | URL, options: any = {}) =>
  fetchJson(url, { ...options, headers: USER_AGENT_HEADERS })

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

export const getBookLinkWithOpenLibraryIds = (book) => {
  const queryParams: any = {
    openLibraryWorkId: book.openLibraryWorkId,
  }

  if (book.openLibraryEditionId) {
    queryParams.openLibraryEditionId = book.openLibraryEditionId
  }

  const queryStr = new URLSearchParams(humps.decamelizeKeys(queryParams))
  const path = `/books?${queryStr}`

  return path
}

export const getBookLinkAgnostic = (book) => {
  if (book.slug) return getBookLink(book.slug)
  return getBookLinkWithOpenLibraryIds(book)
}

export const getPersonLinkWithOpenLibraryId = (openLibraryAuthorId) =>
  `/people?open_library_author_id=${openLibraryAuthorId}`

export const getBookEditLink = (slug: string) => `/books/${slug}/edit`

export const getBookEditLinkWithQueryString = (queryString: any) => `/books/edit?${queryString}`

export const getBookEditCoversLink = (slug: string) => `/books/${slug}/edit/covers`

export const getBookEditAdaptationsLink = (slug: string) => `/books/${slug}/edit/adaptations`

export const getBookListsLink = (slug: string) => `/books/${slug}/lists`

export const getListLink = (userProfile, slug: string) =>
  `/users/${userProfile.username}/lists/${slug}`

export const getListLinkById = (listId: string) => `/lists/${listId}`

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

export function interactionObjectTypeToNotificationObjectType(objectType: string) {
  const specialMappings = {
    [InteractionObjectType.Note]: NotificationObjectType.BookNote,
    [InteractionObjectType.Post]: NotificationObjectType.BookNote,
  }

  return specialMappings[objectType] || objectType
}

export function getWorldCatUrl({ isbn, oclc }: { isbn?: string; oclc?: string }) {
  const baseUrl = "https://www.worldcat.org"

  if (oclc) return `${baseUrl}/oclc/${oclc}`
  if (isbn) return `${baseUrl}/isbn/${isbn}`

  return ""
}

export function isAdmin(userProfile) {
  if (!userProfile?.roleAssignments) return false

  const roles = userProfile.roleAssignments.map((roleAssignment) => roleAssignment.role)
  return roles.includes(UserRole.Admin)
}
