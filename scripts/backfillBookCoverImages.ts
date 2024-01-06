// check DOTENV_PATH, BOOKS_LIMIT, and SLEEP_MS
// for other env, create e.g. `.env.scripts.staging`
// npx ts-node -P tsconfig.scripts.json scripts/backfillBookCoverImages.ts

import dotenv from "dotenv"

const DOTENV_PATH = ".env"
dotenv.config({ path: DOTENV_PATH })

// eslint-disable-next-line
import prisma from "../src/lib/prisma"
// eslint-disable-next-line
import { uploadCoverImage } from "../src/lib/server/supabaseStorage"

const BOOKS_LIMIT = 100
const SLEEP_MS = 500

function sleep(ms) {
  // eslint-disable-next-line
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getCoverUrlsBySize(imageUrl: string) {
  const mPattern = /-M(\.\w+)$/ // filename ends in "-M", followed by file extension
  const lPattern = /-L(\.\w+)$/ // filename ends in "-L", followed by file extension
  let fileExtension

  if (imageUrl.match(mPattern)) {
    fileExtension = imageUrl.match(mPattern)![1]
  } else if (imageUrl.match(lPattern)) {
    fileExtension = imageUrl.match(lPattern)![1]
  } else {
    throw new Error("Image URL must include either -M or -L")
  }

  const imageUrlM = imageUrl.replace(lPattern, `-M${fileExtension}`)
  const imageUrlL = imageUrl.replace(mPattern, `-L${fileExtension}`)

  return {
    md: imageUrlM,
    lg: imageUrlL,
  }
}

async function fetchImageAsBlob(url) {
  const response = await fetch(url)
  const blob = await response.blob()

  const mimeType = blob.type

  return {
    blob,
    mimeType,
  }
}

async function main() {
  let successCount = 0
  const failures: any[] = []

  // fetch all books with covers
  const allBooks = await prisma.book.findMany({
    where: {
      coverImageUrl: {
        not: null,
      },
      coverImageThumbnailUrl: null,
    },
    take: BOOKS_LIMIT,
  })

  console.log(`found ${allBooks.length} books with cover images.`)
  console.log(allBooks.map((b) => b.slug))

  // for each book, fetch cover images, upload to supabase, and update book record
  for (const book of allBooks) {
    await sleep(SLEEP_MS)

    const { coverImageUrl, slug, id } = book

    const { md: olThumbnailUrl, lg: olLargeUrl } = getCoverUrlsBySize(coverImageUrl!) as any

    const baseOptions = {
      bookId: id,
      bookSlug: slug,
      extension: coverImageUrl!.split(".").pop(),
    }

    try {
      console.log(`starting ${slug}...`)
      console.log(`${slug}: fetching large image...`)

      const { blob: largeBlob, mimeType: largeMimeType } = await fetchImageAsBlob(olLargeUrl)

      console.log("large image fetched. uploading...")

      const largeOptions = {
        ...baseOptions,
        size: "lg",
        mimeType: largeMimeType,
      }

      const largeUrl = await uploadCoverImage(largeBlob, largeOptions)

      console.log(`${slug}: large image uploaded. fetching thumbnail image...`)

      const { blob: thumbnailBlob, mimeType: thumbnailMimeType } = await fetchImageAsBlob(
        olThumbnailUrl,
      )

      console.log(`${slug}: thumbnail image fetched. uploading...`)

      const thumbnailOptions = {
        ...baseOptions,
        size: "md",
        mimeType: thumbnailMimeType,
      }

      const thumbnailUrl = await uploadCoverImage(thumbnailBlob, thumbnailOptions)

      console.log(`${slug}: thumbnail image uploaded. updating book...`)

      await prisma.book.update({
        where: {
          id,
        },
        data: {
          coverImageUrl: largeUrl,
          coverImageThumbnailUrl: thumbnailUrl,
          openLibraryCoverImageUrl: coverImageUrl,
        },
      })

      console.log(`${slug} updated.`)

      successCount += 1
    } catch (error: any) {
      failures.push({ slug, error, errorMsg: error.message })
    }
  }

  console.log(`${successCount} books updated.`)
  console.log("failures:")
  console.log(failures)
  console.log(`${failures.length} failures.`)
}

main()
