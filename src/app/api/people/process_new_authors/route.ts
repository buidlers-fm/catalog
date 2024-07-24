import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import logger from "lib/logger"
import { generateUniqueSlug } from "lib/helpers/general"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import PersonBookRelationType from "enums/PersonBookRelationType"
import JobStatus from "enums/JobStatus"
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
        none: {
          relationType: PersonBookRelationType.Author,
        },
      },
    }

    const totalBooksToProcess = await prisma.book.count({
      where: whereConditions,
    })

    let jobLog
    if (totalBooksToProcess > 0) {
      jobLog = await prisma.jobLog.create({
        data: {
          jobName: "api.people.process_new_authors",
          status: JobStatus.Started,
          data: {
            totalBooksToProcess,
          },
        },
      })
    }

    if (totalBooksToProcess > BOOKS_LIMIT) {
      logger.info(
        `api.people.process_new_authors: notifs: found ${totalBooksToProcess} with authors to process, but only processing ${BOOKS_LIMIT}.`,
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
            // if possible duplicate, skip and notify, instead of creating a person
            // ...but if we have already been notified before, skip altogether
            const jobAlreadyAttempted = await prisma.jobLogItem.findFirst({
              where: {
                jobName: "api.people.process_new_authors",
                reference: authorName,
                data: {
                  path: ["bookSlug"],
                  equals: slug,
                },
              },
            })

            if (jobAlreadyAttempted) {
              continue
            }

            const existingAuthorByName = await prisma.person.findFirst({
              where: {
                name: authorName!,
              },
            })

            if (existingAuthorByName) {
              logger.info(
                `api.people.process_new_authors: notifs: found potential existing person ${existingAuthorByName.name} for ${slug}, skipping`,
              )

              await prisma.jobLogItem.create({
                data: {
                  jobLogId: jobLog.id,
                  jobName: "api.people.process_new_authors",
                  status: JobStatus.Failed,
                  reason: "potential duplicate person",
                  reference: authorName,
                  data: {
                    bookSlug: slug,
                    authorName,
                    openLibraryWorkId,
                    openLibraryAuthorId,
                  },
                },
              })

              failures.push({
                bookSlug: slug,
                authorName,
                openLibraryWorkId,
                openLibraryAuthorId,
                errorMsg: `potential duplicate with person: ${existingAuthorByName.slug}`,
              })

              continue
            }

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

        await prisma.jobLogItem.create({
          data: {
            jobLogId: jobLog.id,
            jobName: "api.people.process_new_authors",
            status: JobStatus.Success,
            reference: authorName,
            data: {
              bookSlug: slug,
              authorName,
              personSlug: author.slug,
              openLibraryWorkId,
              openLibraryAuthorId,
            },
          },
        })

        successCount += 1
      } catch (error: any) {
        reportToSentry(error, {
          method: "api.books.process_new_authors",
          bookSlug: slug,
        })

        await prisma.jobLogItem.create({
          data: {
            jobLogId: jobLog.id,
            jobName: "api.people.process_new_authors",
            status: JobStatus.Failed,
            reason: error.message,
            reference: authorName,
            data: {
              bookSlug: slug,
              authorName,
              openLibraryWorkId,
              openLibraryAuthorId,
              error,
              errorMsg: error.message,
            },
          },
        })

        failures.push({ bookSlug: slug, error, errorMsg: error.message })
      }
    }

    logger.info(`api.people.process_new_authors: ${successCount} books updated.`)
    logger.info("api.people.process_new_authors: failures:")
    logger.info(failures)
    logger.info(`api.people.process_new_authors: ${failures.length} failures.`)

    if (failures.length > 0) {
      await prisma.jobLog.update({
        where: {
          id: jobLog.id,
        },
        data: {
          status: JobStatus.PartialSuccess,
          data: {
            totalBooksToProcess,
            successCount,
            failures,
          },
        },
      })
    } else {
      await prisma.jobLog.update({
        where: {
          id: jobLog.id,
        },
        data: {
          status: JobStatus.Success,
          data: {
            totalBooksToProcess,
            successCount,
          },
        },
      })
    }

    return NextResponse.json({}, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
    requireJsonBody: false,
  },
)
