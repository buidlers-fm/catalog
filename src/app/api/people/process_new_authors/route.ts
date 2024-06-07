import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import logger from "lib/logger"
import { generateUniqueSlug } from "lib/helpers/general"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import PersonBookRelationType from "enums/PersonBookRelationType"
import type { NextRequest } from "next/server"

const BOOKS_LIMIT = 30
const SLEEP_MS = 2000

function sleep(ms) {
  // eslint-disable-next-line
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const GET = withApiHandling(
  async (req: NextRequest) => {
    if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized " }, { status: 401 })
    }

    let successCount = 0
    const failures: any[] = []

    // fetch books without person-book relations
    const whereConditions = {
      personBookRelations: {
        none: {},
      },
    }

    const totalBooksToProcess = await prisma.book.count({
      where: whereConditions,
    })

    if (totalBooksToProcess > BOOKS_LIMIT) {
      reportToSentry(
        `api.people.process_new_authors: found ${totalBooksToProcess} with authors to process, but only processing ${BOOKS_LIMIT}.`,
      )
    }

    // fetch a batch
    const books = await prisma.book.findMany({
      where: whereConditions,
      take: BOOKS_LIMIT,
    })

    logger.info(
      `api.people.process_new_authors: found ${books.length} books to process in this batch.`,
    )

    // for each book, try to fetch author info, create author person, and create person-book relation
    for (const book of books) {
      await sleep(SLEEP_MS)

      const { slug, openLibraryWorkId, authorName } = book
      let { openLibraryAuthorId } = book

      try {
        // fetch author id if needed
        if (!openLibraryAuthorId) {
          const authorId = await OpenLibrary.getAuthorIdFromWorkId(openLibraryWorkId!)

          if (authorId) {
            openLibraryAuthorId = authorId
            logger.info(`api.people.process_new_authors: fetched author id ${authorId} for ${slug}`)
          } else {
            logger.info(
              `api.people.process_new_authors: failed to fetch openLibraryAuthorId for ${slug}, proceeding without OL data...`,
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
            logger.info(
              `api.people.process_new_authors: found existing author ${existingPerson.name} for ${slug}`,
            )

            author = existingPerson
          } else {
            try {
              logger.info("api.people.process_new_authors: calling OL...")

              const openLibraryAuthor = await OpenLibrary.getAuthor(openLibraryAuthorId)

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

              logger.info(
                `api.people.process_new_authors: created author ${author.name} from OL for ${slug}`,
              )
            } catch (error: any) {
              logger.info(
                `api.people.process_new_authors: creating from OL failed for ${slug} with error: ${error.message}. trying with just author name...`,
              )
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

          logger.info(
            `api.people.process_new_authors: created author ${author.name} from authorName for ${slug}`,
          )
        }

        // create person-book relation
        logger.info(
          `api.people.process_new_authors: creating relation for ${author.name} and ${slug}...`,
        )

        if (author) {
          await prisma.personBookRelation.create({
            data: {
              personId: author.id,
              bookId: book.id,
              relationType: PersonBookRelationType.Author,
            },
          })

          logger.info(
            `api.people.process_new_authors: created relation for ${author.name} and ${slug}.`,
          )
        } else {
          throw new Error(`failed to create author for ${slug}`)
        }

        successCount += 1
      } catch (error: any) {
        reportToSentry(error, {
          method: "api.books.process_new_authors",
          bookSlug: slug,
        })

        failures.push({ slug, error, errorMsg: error.message })
      }
    }

    logger.info(`api.people.process_new_authors: ${successCount} books updated.`)
    logger.info("api.people.process_new_authors: failures:")
    logger.info(failures)
    logger.info(`api.people.process_new_authors: ${failures.length} failures.`)

    return NextResponse.json({}, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
    requireJsonBody: false,
  },
)
