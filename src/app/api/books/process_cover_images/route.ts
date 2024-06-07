import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import logger from "lib/logger"
import { uploadCoverImage } from "lib/server/supabaseStorage"
import { fetchImageAsBlob } from "lib/helpers/general"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import type { NextRequest } from "next/server"

const BOOKS_LIMIT = 30

export const GET = withApiHandling(
  async (req: NextRequest) => {
    if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized " }, { status: 401 })
    }

    let successCount = 0
    const failures: any[] = []

    // where cover image is present but thumbnail isn't, OR
    // either image is an openlibrary image
    const whereConditions = {
      OR: [
        {
          AND: [
            {
              coverImageUrl: {
                not: null,
              },
            },
            {
              coverImageThumbnailUrl: {
                equals: null,
              },
            },
          ],
        },
        {
          coverImageUrl: {
            contains: "openlibrary",
          },
        },
        {
          coverImageThumbnailUrl: {
            contains: "openlibrary",
          },
        },
      ],
    }

    const totalBooksToProcess = await prisma.book.count({
      where: whereConditions,
    })

    if (totalBooksToProcess > BOOKS_LIMIT) {
      reportToSentry(
        `api.books.process_cover_images: found ${totalBooksToProcess} with cover images to process, but only processing ${BOOKS_LIMIT}.`,
      )
    }

    // fetch a batch of books with covers that haven't been processed
    const allBooks = await prisma.book.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: "asc",
      },
      take: BOOKS_LIMIT,
    })

    logger.info(
      `api.books.process_cover_images: found ${allBooks.length} books with cover images in this batch.`,
    )

    // for each book, fetch cover images, upload to supabase, and update book record
    for (const book of allBooks) {
      const { coverImageUrl, slug, id } = book

      const { md: olThumbnailUrl, lg: olLargeUrl } = OpenLibrary.getCoverUrlsBySize(
        coverImageUrl!,
      ) as any

      const baseOptions = {
        bookId: id,
        bookSlug: slug,
        extension: coverImageUrl!.split(".").pop(),
      }

      try {
        logger.info(`api.books.process_cover_images: starting ${slug}...`)
        logger.info(`api.books.process_cover_images: ${slug}: fetching large image...`)

        const { blob: largeBlob, mimeType: largeMimeType } = await fetchImageAsBlob(olLargeUrl)

        logger.info(`api.books.process_cover_images: ${slug}: large image fetched. uploading...`)

        const largeOptions = {
          ...baseOptions,
          size: "lg",
          mimeType: largeMimeType,
        }

        const largeUrl = await uploadCoverImage(largeBlob, largeOptions)

        logger.info(
          `api.books.process_cover_images: ${slug}: large image uploaded. fetching thumbnail image...`,
        )

        const { blob: thumbnailBlob, mimeType: thumbnailMimeType } = await fetchImageAsBlob(
          olThumbnailUrl,
        )

        logger.info(
          `api.books.process_cover_images: ${slug}: thumbnail image fetched. uploading...`,
        )

        const thumbnailOptions = {
          ...baseOptions,
          size: "md",
          mimeType: thumbnailMimeType,
        }

        const thumbnailUrl = await uploadCoverImage(thumbnailBlob, thumbnailOptions)

        logger.info(
          `api.books.process_cover_images: ${slug}: thumbnail image uploaded. updating book...`,
        )

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

        logger.info(`api.books.process_cover_images: ${slug} updated.`)

        successCount += 1
      } catch (error: any) {
        reportToSentry(error, { slug, coverImageUrl })
        failures.push({ slug, error, errorMsg: error.message })
      }
    }

    logger.info(`${successCount} books updated.`)
    logger.info("failures:")
    logger.info(failures)
    logger.info(`${failures.length} failures.`)

    return NextResponse.json({}, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
    requireJsonBody: false,
  },
)
