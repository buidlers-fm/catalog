import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
// import { getCurrentUserProfile } from "lib/server/auth"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"
import BookReadStatus from "enums/BookReadStatus"
import BookNoteType from "enums/BookNoteType"
import EditedObjectType from "enums/EditedObjectType"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    // const currentUserProfile = await getCurrentUserProfile()

    const username = _req.nextUrl.searchParams.get("username")
    const year = _req.nextUrl.searchParams.get("year")

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 })
    }

    if (!year) {
      return NextResponse.json({ error: "year is required" }, { status: 400 })
    }

    const userProfile = await prisma.userProfile.findFirst({
      where: {
        username,
      },
    })

    if (!userProfile) {
      return NextResponse.json({ error: "user not found" }, { status: 404 })
    }

    if (year !== "2024") {
      return NextResponse.json({ error: "year must be 2024" }, { status: 400 })
    }

    const yearStart = new Date("2024-01-01T00:00:00.000Z")
    const yearEnd = new Date("2025-01-01T00:00:00.000Z")

    const allFinishedBookReads = await prisma.bookRead.findMany({
      where: {
        readerId: userProfile.id,
        endDate: {
          gte: yearStart,
          lt: yearEnd,
        },
        status: BookReadStatus.Finished,
      },
      orderBy: {
        endDate: "desc",
      },
      include: {
        book: true,
      },
    })

    const allBooksFinished = allFinishedBookReads.map((bookRead) => bookRead.book)

    const allBookReads = await prisma.bookRead.findMany({
      where: {
        readerId: userProfile.id,
        endDate: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
    })

    const numBooksStarted = allBookReads.length

    const numBooksFinished = allBookReads.filter(
      (bookRead) => bookRead.status === BookReadStatus.Finished,
    ).length

    const avgBooksFinishedPerMonth = parseFloat((numBooksFinished / 12).toFixed(1))

    const numBooksAbandoned = allBookReads.filter(
      (bookRead) => bookRead.status === BookReadStatus.Abandoned,
    ).length

    const numBooksLiked = await prisma.interaction.count({
      where: {
        agentId: userProfile.id,
        interactionType: InteractionType.Like,
        agentType: InteractionAgentType.User,
        objectType: InteractionObjectType.Book,
        createdAt: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
    })

    const bookLikes = await prisma.interaction.findMany({
      where: {
        agentId: userProfile.id,
        interactionType: InteractionType.Like,
        agentType: InteractionAgentType.User,
        objectType: InteractionObjectType.Book,
        createdAt: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
    })

    const booksLiked = (
      await prisma.book.findMany({
        where: {
          id: {
            in: bookLikes.map((like) => like.objectId),
          },
        },
      })
    ).map((book) => book.title)

    const numNotesCreated = await prisma.bookNote.count({
      where: {
        creatorId: userProfile.id,
        createdAt: {
          gte: yearStart,
          lt: yearEnd,
        },
        noteType: BookNoteType.JournalEntry,
        AND: [
          {
            text: {
              not: null,
            },
          },
          {
            text: {
              not: "",
            },
          },
        ],
      },
    })

    const numListsCreated = await prisma.list.count({
      where: {
        creatorId: userProfile.id,
        createdAt: {
          gte: yearStart,
          lt: yearEnd,
        },
      },
    })

    const numBooksEdited = (
      await prisma.editLog.groupBy({
        by: ["editedObjectId"],
        where: {
          editorId: userProfile.id,
          editedObjectType: EditedObjectType.Book,
          createdAt: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
      })
    ).length

    const resData = {
      numBooksStarted,
      numBooksFinished,
      avgBooksFinishedPerMonth,
      numBooksAbandoned,
      numBooksLiked,
      booksLiked,
      numNotesCreated,
      numListsCreated,
      numBooksEdited,
      allBooksFinished,
    }

    const resBody = humps.decamelizeKeys(resData)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
