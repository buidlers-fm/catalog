// check all constants in ALL_CAPS
// for other env, create e.g. `.env.scripts.staging`
// npx ts-node -P tsconfig.scripts.json scripts/importPersonBookRelations.ts

import dotenv from "dotenv"

const DOTENV_PATH = ".env"
dotenv.config({ path: DOTENV_PATH })

// eslint-disable-next-line
import { createReadStream } from "fs"
// eslint-disable-next-line
import { finished } from "stream/promises"
// eslint-disable-next-line
import csv from "csv-parser"
// eslint-disable-next-line
import humps from "humps"
// eslint-disable-next-line
import dayjs from "dayjs"
// eslint-disable-next-line
import customParseFormat from "dayjs/plugin/customParseFormat"
// eslint-disable-next-line
import prisma from "../src/lib/prisma"
// eslint-disable-next-line
import slugify from "slug"
// eslint-disable-next-line
import crypto from "crypto"
// eslint-disable-next-line
import { isSameLanguage } from "../src/lib/helpers/strings"
// eslint-disable-next-line
import { personBookRelationTypeCopy } from "../src/enums/PersonBookRelationType"

dayjs.extend(customParseFormat)

const PREVIOUS_IMPORT_SOURCE = "person_book_relations_2024-07-08"
const CSV_PATH = "./scripts/data/person_book_relations_2024-07-09.csv" // path relative to the directory where you run the script
const IMPORT_SOURCE = "person_book_relations_2024-07-09"

const CSV_COLUMNS_TO_ATTRS = {
  Person: "name",
  Org: "orgName",
  Role: "relationTypeCopy", // needs to be converted to enum value
  "Sub-Role": "detail",
  "Book Title": "bookTitle",
  "Book Author": "bookAuthorName",
  "Book OL id": "openLibraryWorkId",
  "Book catalog slug": "bookCatalogUrl", // needs to be converted to slug
  "Source Type": "sourceType",
}

const RELATION_COPY_TO_RELATION_NAMES = Object.entries(personBookRelationTypeCopy).reduce(
  (acc, [key, value]) => {
    acc[value] = key
    return acc
  },
  {},
)

// OpenLibrary constants
const SLEEP_MS = 2000
const BASE_URL = "https://openlibrary.org"
const COVERS_BASE_URL = "https://covers.openlibrary.org/b"
const PUBLISH_DATE_FORMATS = ["YYYY", "MMMM YYYY", "MMMM D, YYYY", "MMM D, YYYY", "YYYY-MM-DD"]

function sleep(ms) {
  // eslint-disable-next-line
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function readCsv(filePath: string) {
  const results: any[] = []
  const stream = createReadStream(filePath).pipe(csv())

  for await (const row of stream) {
    const mappedRow = Object.keys(row).reduce((obj, key) => {
      const attrName = CSV_COLUMNS_TO_ATTRS[key]
      const value = row[key]

      if (!attrName) return obj

      if (attrName === "relationTypeCopy") {
        obj.relationTypeCopy = value
        obj.relationType = RELATION_COPY_TO_RELATION_NAMES[value]
        return obj
      } else if (attrName === "bookCatalogUrl") {
        const trimmedUrl = value.replace(/\/$/, "")
        obj.bookSlug = trimmedUrl.split("/").pop()
      }

      obj[attrName] = row[key]

      return obj
    }, {} as any)

    results.push(mappedRow)
  }

  await finished(stream)

  return results
}

function getRandomHex() {
  return crypto.randomBytes(3).toString("hex")
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

async function getFullBook(workId: string, bestEditionId?: string) {
  // get work
  const workUrl = `${BASE_URL}/works/${workId}.json`
  const work = await fetchJson(workUrl)

  let bestEdition

  if (bestEditionId) {
    const bestEditionUrl = `${BASE_URL}/editions/${bestEditionId}.json`
    bestEdition = await fetchJson(bestEditionUrl)
  }

  // get editions and first book data
  const editionsUrl = `${BASE_URL}/works/${workId}/editions.json`
  const editionsRes = await fetchJson(editionsUrl)
  const _editions = editionsRes.entries
  let editions = [..._editions].sort((a, b) => {
    if (!a.latestRevision) return 1
    if (!b.latestRevision) return -1
    return b.latestRevision - a.latestRevision
  })

  const isEnglishEdition = (e) =>
    e.languages && e.languages.length === 1 && e.languages[0].key === "/languages/eng"

  if (bestEdition) {
    // make it first in the array
    const rest = editions.filter((e) => e.key !== bestEdition.key)
    editions = [bestEdition, ...rest]
  } else {
    bestEdition = editions.find(
      (e) => isEnglishEdition(e) || !e.languages || e.languages.length === 0,
    )
  }

  // determine whether original language is english
  const bestEnglishEdition = editions.find((e) => isEnglishEdition(e))

  const isTranslated = !!bestEnglishEdition && !isSameLanguage(work.title, bestEnglishEdition.title)

  const authorKey = work.authors?.[0]?.author?.key
  const authorId = authorKey?.split("/authors/").pop()

  const getCoverUrl = (coverId: string) => `${COVERS_BASE_URL}/id/${coverId}-L.jpg`

  let coverImageUrl

  // first work cover
  if (work && work.covers && work.covers.length > 0) {
    coverImageUrl = getCoverUrl(work.covers[0])
  }

  // if no work cover, fall back to best edition that has a cover
  if (!coverImageUrl) {
    const bestEditionWithCover = editions.find(
      (edition: any) => edition.covers && edition.covers.length > 0,
    )

    if (bestEditionWithCover) {
      coverImageUrl = getCoverUrl(bestEditionWithCover.covers[0])
    }
  }

  if (isTranslated) {
    // best english edition cover wins over any other cover
    const bestEnglishEditionWithCover = editions.find(
      (e) => isEnglishEdition(e) && e.covers && e.covers.length > 0,
    )
    if (bestEnglishEditionWithCover) {
      coverImageUrl = getCoverUrl(bestEnglishEditionWithCover.covers[0])
    }
  }

  // polyfill schema inconsistencies
  const description = work.description?.value || work.description

  const getFirstPublishedYear = () => {
    const pubYears = editions
      .map((e) => {
        const dayjsDate = dayjs(e.publishDate, PUBLISH_DATE_FORMATS)
        if (!dayjsDate.isValid()) return null
        return dayjsDate.year()
      })
      .filter((year) => !!year)

    return Math.min(...(pubYears as number[]))
  }

  const book = {
    title: isTranslated ? bestEnglishEdition.title : work.title,
    subtitle: isTranslated
      ? bestEnglishEdition.subtitle || work.subtitle || bestEdition.subtitle
      : work.subtitle || bestEnglishEdition?.subtitle,
    openLibraryAuthorId: authorId,
    description,
    coverImageUrl,
    openLibraryCoverImageUrl: coverImageUrl,
    editionsCount: editionsRes.size,
    firstPublishedYear: getFirstPublishedYear(),
    openLibraryWorkId: workId,
    isTranslated,
    originalTitle: work.title,
  }

  return book
}

async function main() {
  const startTime = new Date()
  let count = 0
  let successCount = 0
  const invalidRows: any[] = []
  const failures: any[] = []
  const duplicates: any[] = []

  console.log(`deleting records from previous import source ${PREVIOUS_IMPORT_SOURCE}...`)

  await prisma.personBookRelation.deleteMany({
    where: {
      importSource: PREVIOUS_IMPORT_SOURCE,
    },
  })

  console.log(`deleted records from previous import source. reading csv...`)

  const rows = await readCsv(CSV_PATH)

  console.log(`processing ${rows.length} rows...`)

  for (const row of rows) {
    console.log(`processing row ${count + 1}...`)

    try {
      // some validations
      if (!row.relationTypeCopy) {
        console.log("relationType (role) is required")
        invalidRows.push({ name: row.name })

        count += 1
        continue
      }

      if (!row.relationType) {
        console.log(`relationType ${row.relationTypeCopy} not supported, skipping...`)
        invalidRows.push({ name: row.name, relationTypeCopy: row.relationTypeCopy })

        count += 1
        continue
      }
      // end validations

      let person
      let book

      // find or create person
      const existingPerson = await prisma.person.findFirst({
        where: { name: row.name },
      })

      if (existingPerson) {
        console.log(`person ${row.name} found.`)
        person = existingPerson
      } else {
        console.log(`person ${row.name} not found, creating...`)
        const slug = await generateUniqueSlug(row.name, "person")

        person = await prisma.person.create({
          data: {
            name: row.name,
            slug,
            importSource: IMPORT_SOURCE,
          },
        })

        console.log(`person ${row.name} created.`)
      }

      // find or create book
      if (!row.openLibraryWorkId && !row.bookSlug) {
        throw new Error("neither openLibraryWorkId nor catalog slug provided")
      }

      let existingBook

      if (row.bookSlug) {
        console.log(`fetching db book for slug ${row.bookSlug}...`)
        existingBook = await prisma.book.findFirst({
          where: { slug: row.bookSlug },
        })
      }

      if (!existingBook && row.openLibraryWorkId) {
        console.log(`fetching db book for openLibraryWorkId ${row.openLibraryWorkId}...`)
        existingBook = await prisma.book.findFirst({
          where: { openLibraryWorkId: row.openLibraryWorkId },
        })
      }

      if (existingBook) {
        console.log(`book ${row.bookTitle} found.`)
        book = existingBook
      } else {
        console.log(`book ${row.bookTitle} not found, creating...`)

        await sleep(SLEEP_MS)

        console.log(`fetching from OL for ${row.openLibraryWorkId}...`)
        const openLibraryBook = await getFullBook(row.openLibraryWorkId)
        const authorName = row.bookAuthorName
        const bookSlug = await generateUniqueSlug(`${row.bookTitle} ${authorName}`, "book")

        book = await prisma.book.create({
          data: {
            ...openLibraryBook,
            slug: bookSlug,
            authorName,
          },
        })
      }

      if (!row.relationType) {
        throw new Error("relationType (role) is required")
      }

      // create relation (unless already exists)
      const existingRelation = await prisma.personBookRelation.findFirst({
        where: {
          personId: person.id,
          bookId: book.id,
          relationType: row.relationType,
        },
      })

      if (existingRelation) {
        console.log(`relation for ${row.name} and ${row.bookTitle} already exists.`)

        duplicates.push({
          name: row.name,
          bookTitle: row.bookTitle,
          relationType: row.relationType,
        })

        count += 1
        continue
      }

      console.log(`creating relation for ${row.name} and ${row.bookTitle}...`)
      await prisma.personBookRelation.create({
        data: {
          personId: person.id,
          bookId: book.id,
          relationType: row.relationType,
          detail: row.detail,
          orgName: row.orgName,
          sourceType: row.sourceType,
          importSource: IMPORT_SOURCE,
        },
      })

      successCount += 1
    } catch (error: any) {
      console.log(`failed to create relation ${count} ${row.name} with error: ${error.message}`)
      failures.push({ name: row.name, error, errorMsg: error.message })
    }

    count += 1
  }

  const endTime = new Date()
  const elapsedMs = endTime.valueOf() - startTime.valueOf()
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60

  console.log(`${successCount} person-book relations created in ${minutes}m ${seconds}s.`)
  console.log("invalid rows:")
  console.log(invalidRows)
  console.log("failures:")
  console.log(failures)
  console.log(`${failures.length} failures.`)
  console.log("duplicates:")
  console.log(duplicates)
  console.log(`${duplicates.length} relations already in db.`)
}

main()
