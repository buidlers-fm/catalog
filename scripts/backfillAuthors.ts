// check DOTENV_PATH, BOOKS_LIMIT, and SLEEP_MS
// for other env, create e.g. `.env.scripts.staging`
// npx ts-node -P tsconfig.scripts.json scripts/backfillAuthors.ts

import dotenv from "dotenv"

const DOTENV_PATH = ".env"
dotenv.config({ path: DOTENV_PATH })

// eslint-disable-next-line
import humps from "humps"
// eslint-disable-next-line
import prisma from "../src/lib/prisma"
// eslint-disable-next-line
import slugify from "slug"
// eslint-disable-next-line
import crypto from "crypto"
// eslint-disable-next-line
import PersonBookRelationType from "../src/enums/PersonBookRelationType"

const BOOKS_LIMIT = 200
const SLEEP_MS = 2000

const BASE_URL = "https://openlibrary.org"
const AUTHOR_IMAGE_BASE_URL = "https://covers.openlibrary.org/a/id"

enum OpenLibraryCoverSize {
  S = "S",
  M = "M",
  L = "L",
}

const WIKIDATA_BASE_URL = "https://wikidata.org/w/rest.php/wikibase/v0"
const WIKIDATA_ITEM_BASE_URL = `${WIKIDATA_BASE_URL}/entities/items`

const WIKIPEDIA_BASE_URL = "https://en.wikipedia.org/api/rest_v1"
const WIKIPEDIA_SUMMARY_BASE_URL = `${WIKIPEDIA_BASE_URL}/page/summary`

const GET_ITEM_DEFAULT_OPTIONS = {
  compact: false,
}

const USER_AGENT_HEADERS = {
  "User-Agent": "catalog.fyi/v0 (staff@catalog.fyi) Next.js/14",
}

function sleep(ms) {
  // eslint-disable-next-line
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomHex() {
  return crypto.randomBytes(3).toString("hex")
}

async function fetchJson(url: string | URL, options: any = {}) {
  const TIMEOUT = 10_000 // 10 seconds

  const fetchPromise = fetch(url, options)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), TIMEOUT)
  })

  const res: any = await Promise.race([fetchPromise, timeoutPromise])

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
}

async function fetchJsonWithUserAgentHeaders(url: string | URL, options: any = {}) {
  return fetchJson(url, { ...options, headers: USER_AGENT_HEADERS })
}

async function getWikidataItem(id: string, options: any = GET_ITEM_DEFAULT_OPTIONS) {
  const { compact } = options

  const url = `${WIKIDATA_ITEM_BASE_URL}/${id}`
  const item = await fetchJsonWithUserAgentHeaders(url)

  const { labels, sitelinks } = item

  const name = labels.en
  const { title: siteTitle, url: siteUrl } = sitelinks.enwiki || {}

  if (compact || !siteUrl) {
    return { name, siteTitle, siteUrl }
  }

  const siteUrlFragment = siteUrl.split("/").pop()
  const wikipediaSummaryUrl = `${WIKIPEDIA_SUMMARY_BASE_URL}/${siteUrlFragment}`

  const wikipediaSummaryRes = await fetchJsonWithUserAgentHeaders(wikipediaSummaryUrl)
  const wikipediaSummary = wikipediaSummaryRes.extract

  let imageUrl
  if (wikipediaSummaryRes.thumbnail) {
    imageUrl = wikipediaSummaryRes.thumbnail.source
  }

  return {
    name,
    siteTitle,
    siteUrl,
    summary: wikipediaSummary,
    imageUrl,
  }
}

async function getOpenLibraryAuthorId(workId: string) {
  // get work
  const workUrl = `${BASE_URL}/works/${workId}.json`
  const work = await fetchJsonWithUserAgentHeaders(workUrl)

  // get author from work
  const authorKey = work.authors?.[0]?.author?.key
  const authorId = authorKey?.split("/authors/").pop()

  return authorId
}

function getAuthorImageUrl(id: string | number, size: OpenLibraryCoverSize) {
  return `${AUTHOR_IMAGE_BASE_URL}/${id}-${size}.jpg`
}

async function getAuthor(authorId: string) {
  const authorUrl = `${BASE_URL}/authors/${authorId}.json`
  let openLibraryAuthor = await fetchJsonWithUserAgentHeaders(authorUrl)

  // follow a redirect
  if (openLibraryAuthor.type.key === "/type/redirect") {
    const nextAuthorKey = openLibraryAuthor.location
    const nextAuthorUrl = `${BASE_URL}/${nextAuthorKey}.json`
    openLibraryAuthor = await fetchJsonWithUserAgentHeaders(nextAuthorUrl)
  }

  const name = openLibraryAuthor.personalName || openLibraryAuthor.name
  const bio = openLibraryAuthor.bio?.value
  const photoId = openLibraryAuthor.photos?.[0]

  let imageUrl
  if (photoId) {
    imageUrl = getAuthorImageUrl(photoId, OpenLibraryCoverSize.M)
    console.log(`${name} has an image!`)
  }

  let authorName = name
  let authorBio = bio
  let wikipediaUrl

  // get more author info from wikidata
  const wikidataId = openLibraryAuthor.remoteIds?.wikidata
  if (wikidataId) {
    const wikidataRes = await getWikidataItem(wikidataId)
    const {
      name: wikidataName,
      siteUrl,
      summary: wikipediaBio,
      imageUrl: wikipdiaImage,
    } = wikidataRes || {}

    authorName = wikidataName
    authorBio = wikipediaBio
    wikipediaUrl = siteUrl
    imageUrl = wikipdiaImage || imageUrl
  }

  const author = {
    name: authorName,
    bio: authorBio,
    imageUrl,
    openLibraryAuthorId: authorId,
    wikipediaUrl,
    wikidataId,
  }

  return author
}

async function generateUniqueSlug(str, modelName, additionalFilters = {}) {
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
    const randomString = getRandomHex()
    slug = `${simpleSlug}-${randomString}`
    const filters = { slug, ...additionalFilters }
    isSlugTaken = !!(await (prisma[modelName] as any).findFirst({ where: filters }))
  }

  return slug
}

async function main() {
  const startTime = new Date()
  let count = 0
  let successCount = 0
  const failures: any[] = []

  // fetch books without person-book relations
  const books = await prisma.book.findMany({
    where: {
      personBookRelations: {
        none: {
          relationType: PersonBookRelationType.Author,
        },
      },
    },
    take: BOOKS_LIMIT,
  })

  console.log(`found ${books.length} books without author person-book relations.`)
  console.log(books.map((b) => b.slug))

  // for each book, create the person (author) and the person-book relation
  for (const book of books) {
    await sleep(SLEEP_MS)

    const { slug, openLibraryWorkId, authorName } = book
    let { openLibraryAuthorId } = book

    try {
      console.log(`${count + 1}: starting ${slug}...`)

      // fetch author id if needed
      if (!openLibraryAuthorId) {
        const authorId = await getOpenLibraryAuthorId(openLibraryWorkId!)

        if (authorId) {
          openLibraryAuthorId = authorId
          console.log(`fetched author id ${authorId} for ${slug}`)
        } else {
          console.log(
            `failed to fetch openLibraryAuthorId for ${slug}, proceeding without OL data...`,
          )
        }
      }

      // try to fetch author info
      let author

      if (openLibraryAuthorId) {
        const existingPerson = await prisma.person.findFirst({
          where: {
            openLibraryAuthorId,
          },
        })

        if (existingPerson) {
          console.log(`found existing author ${existingPerson.name} for ${slug}`)

          author = existingPerson
        } else {
          try {
            console.log("calling OL...")

            const openLibraryAuthor = await getAuthor(openLibraryAuthorId)

            const authorSlug = await generateUniqueSlug(openLibraryAuthor.name, "person")

            if (openLibraryAuthor) {
              author = await prisma.person.create({
                data: {
                  slug: authorSlug,
                  name: openLibraryAuthor.name,
                  imageUrl: openLibraryAuthor.imageUrl,
                  wikipediaUrl: openLibraryAuthor.wikipediaUrl,
                  bio: openLibraryAuthor.bio,
                  openLibraryAuthorId,
                  wikidataId: openLibraryAuthor.wikidataId,
                },
              })
            }

            console.log(`created author ${author.name} from OL for ${slug}`)
          } catch (error: any) {
            console.log(
              `creating from OL failed for ${slug} with error: ${error.message}. trying with just author name...`,
            )

            failures.push({ slug, error, errorMsg: `creating from OL failed: ${error.message}` })
          }
        }
      }

      // if the above failed, create author person without extra info
      if (!author && authorName) {
        const authorSlug = await generateUniqueSlug(authorName, "person")

        author = await prisma.person.create({
          data: {
            slug: authorSlug,
            name: authorName,
          },
        })

        console.log(`created author ${author.name} from authorName for ${slug}`)
      }

      // create person-book relation
      console.log(`creating relation for ${author.name} and ${slug}...`)

      if (author) {
        await prisma.personBookRelation.create({
          data: {
            personId: author.id,
            bookId: book.id,
            relationType: PersonBookRelationType.Author,
          },
        })

        console.log(`created relation for ${author.name} and ${slug}.`)
      } else {
        throw new Error(`failed to create author for ${slug}`)
      }

      successCount += 1
    } catch (error: any) {
      console.log(`failed to create author for ${slug} with error: ${error.message}`)
      failures.push({ slug, error, errorMsg: error.message })
    }

    count += 1
  }

  const endTime = new Date()
  const elapsedMs = endTime.valueOf() - startTime.valueOf()
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60

  console.log(`${successCount} authors created in ${minutes}m ${seconds}s.`)
  console.log("failures:")
  console.log(failures)
  console.log(`${failures.length} failures.`)
}

main()
