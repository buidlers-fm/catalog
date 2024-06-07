import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import logger from "lib/logger"
import { uploadPersonImage } from "lib/server/supabaseStorage"
import { fetchImageAsBlob } from "lib/helpers/general"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import type { NextRequest } from "next/server"

const PEOPLE_LIMIT = 30

export const GET = withApiHandling(
  async (req: NextRequest) => {
    if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized " }, { status: 401 })
    }

    let successCount = 0
    const failures: any[] = []

    // where imageUrl is present but is not a supabase image
    const whereConditions = {
      imageUrl: {
        not: null,
      },
      NOT: {
        imageUrl: {
          contains: "supabase",
        },
      },
    }

    const totalPeopleToProcess = await prisma.person.count({
      where: whereConditions,
    })

    if (totalPeopleToProcess > PEOPLE_LIMIT) {
      reportToSentry(
        `api.people.process_new_images: found ${totalPeopleToProcess} with images to process, but only processing ${PEOPLE_LIMIT}.`,
      )
    }

    // fetch a batch of people with images that haven't been processed
    const people = await prisma.person.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: "asc",
      },
      take: PEOPLE_LIMIT,
    })

    logger.info(
      `api.people.process_new_images: found ${people.length} people with images in this batch.`,
    )

    // for each person, fetch image, upload to supabase, and update book record
    for (const person of people) {
      const { imageUrl, slug, id } = person

      const baseOptions = {
        personId: id,
        personSlug: slug,
        extension: imageUrl!.split(".").pop(),
      }

      try {
        logger.info(`api.people.process_new_images: starting ${slug}...`)
        logger.info(`api.people.process_new_images: ${slug}: fetching image...`)

        const { blob, mimeType } = await fetchImageAsBlob(imageUrl)

        logger.info(`api.people.process_new_images: ${slug}: image fetched. uploading...`)

        const options = {
          ...baseOptions,
          mimeType,
        }

        const supabaseUrl = await uploadPersonImage(blob, options)

        logger.info(`api.people.process_new_images: ${slug}: image uploaded. updating person...`)

        await prisma.person.update({
          where: {
            id,
          },
          data: {
            imageUrl: supabaseUrl,
            originalImageUrl: imageUrl,
          },
        })

        logger.info(`api.people.process_new_images: ${slug} updated.`)

        successCount += 1
      } catch (error: any) {
        reportToSentry(error, {
          method: "api.people.process_new_images",
          slug,
          imageUrl,
        })

        failures.push({ slug, error, errorMsg: error.message })
      }
    }

    logger.info(`${successCount} people updated.`)
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
