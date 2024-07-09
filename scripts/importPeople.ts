// this is for people who aren't authors, therefore we will not hit OpenLibrary for data.
//
// check CSV_PATH, IMPORT_SOURCE, and CSV_COLUMNS_TO_ATTRS
// for other env, create e.g. `.env.scripts.staging`
// npx ts-node -P tsconfig.scripts.json scripts/importPeople.ts

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
import prisma from "../src/lib/prisma"
// eslint-disable-next-line
import slugify from "slug"
// eslint-disable-next-line
import crypto from "crypto"

const CSV_PATH = "./scripts/data/people_2024-07-08.csv" // path relative to the directory where you run the script
const IMPORT_SOURCE = "people_2024-07-08"

const CSV_COLUMNS_TO_ATTRS = {
  Name: "name",
  "Org (Primary)": "orgName",
  "Sub-Role / Title (?)": "title",
  Bio: "bio",
  Location: "location",
  Image: "imageUrl",
  Source: "source",
  Website: "website",
  Twitter: "twitter",
  Insta: "instagram",
}

async function readCsv(filePath: string) {
  const results: any[] = []
  const stream = createReadStream(filePath).pipe(csv())

  for await (const row of stream) {
    const mappedRow = Object.keys(row).reduce((obj, key) => {
      if (!CSV_COLUMNS_TO_ATTRS[key]) return obj

      obj[CSV_COLUMNS_TO_ATTRS[key]] = row[key]

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

async function main() {
  const startTime = new Date()
  let count = 0
  let successCount = 0
  const failures: any[] = []
  const duplicates: any[] = []

  const rows = await readCsv(CSV_PATH)

  console.log(`processing ${rows.length} rows...`)

  // for each row, create the person (unless a person with that name already exists)
  for (const row of rows) {
    console.log(`processing row ${count + 1}...`)

    // check for duplicates
    const existingPerson = await prisma.person.findFirst({
      where: { name: row.name },
    })

    if (existingPerson) {
      duplicates.push(row.name)
      continue
    }

    // proceed
    const slug = await generateUniqueSlug(row.name, "person")

    try {
      await prisma.person.create({
        data: {
          ...row,
          slug,
          importSource: IMPORT_SOURCE,
        },
      })

      successCount += 1
    } catch (error: any) {
      console.log(`failed to create person ${row.name} with error: ${error.message}`)
      failures.push({ name: row.name, error, errorMsg: error.message })
    }

    count += 1
  }

  const endTime = new Date()
  const elapsedMs = endTime.valueOf() - startTime.valueOf()
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60

  console.log(`${successCount} people created in ${minutes}m ${seconds}s.`)
  console.log("failures:")
  console.log(failures)
  console.log(`${failures.length} failures.`)
  console.log("duplicates:")
  console.log(duplicates)
  console.log(`${duplicates.length} people already in db.`)
}

main()
