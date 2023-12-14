import { NextResponse } from "next/server"
import humps from "humps"
import validations from "lib/constants/validations"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { getBookNotes } from "lib/server/bookNotes"
import { findOrCreateBook } from "lib/api/books"
import BookNoteType from "enums/BookNoteType"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"
import Sort from "enums/Sort"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const bookId = queryParams.get("book_id") || undefined
    const userProfileId = queryParams.get("user_profile_id") || undefined
    const noteTypes = queryParams.get("note_types")?.split(",") as BookNoteType[]
    const limit = Number(queryParams.get("limit")) || undefined
    const requireText = queryParams.get("require_text") === "true"
    const sort = (queryParams.get("sort") as Sort) || undefined

    const bookNotes = await getBookNotes({
      currentUserProfile,
      bookId,
      userProfileId,
      noteTypes,
      limit,
      requireText,
      sort,
    })

    const resBody = humps.decamelizeKeys(bookNotes)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { bookNote, bookRead, book, like } = reqJson

  const { text, readingStatus } = bookNote

  const bookNoteValidations = validations.bookNote

  if (text && text.length > bookNoteValidations.text.maxLength) {
    const errorMsg = `Text cannot be longer than ${bookNoteValidations.text.maxLength} characters.`
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  let bookId = book.id
  if (!bookId) {
    const dbBook = await findOrCreateBook(book)
    bookId = dbBook.id
  }

  const connectBookParams = {
    connect: {
      id: bookId,
    },
  }

  const { startDate: startDateStr, endDate: endDateStr } = bookRead
  const startDate = startDateStr ? new Date(startDateStr) : undefined
  const endDate = endDateStr ? new Date(endDateStr) : undefined

  const bookReadParams = {
    startDate,
    endDate,
    reader: {
      connect: {
        id: userProfile.id,
      },
    },
    book: connectBookParams,
    updatedAt: new Date(),
  }

  let connectOrCreateBookReadParams
  let updateBookReadPromise

  if (readingStatus === BookNoteReadingStatus.Started) {
    // create a book read
    connectOrCreateBookReadParams = {
      create: bookReadParams,
    }
  } else {
    // look for a matching book read. if found, connect it and update it. otherwise, create one.
    const lastUnfinishedBookRead = await prisma.bookRead.findFirst({
      where: {
        bookId: book.id,
        readerId: userProfile.id,
        startDate: {
          not: null,
        },
        endDate: null,
      },
      orderBy: {
        startDate: "desc",
      },
    })

    if (lastUnfinishedBookRead) {
      connectOrCreateBookReadParams = {
        connect: {
          id: lastUnfinishedBookRead.id,
        },
      }

      updateBookReadPromise = prisma.bookRead.update({
        where: {
          id: lastUnfinishedBookRead.id,
        },
        data: {
          startDate,
          endDate,
          updatedAt: new Date(),
        },
      })
    } else {
      // create a book read
      connectOrCreateBookReadParams = {
        create: bookReadParams,
      }
    }
  }

  const createBookNotePromise = prisma.bookNote.create({
    data: {
      noteType: BookNoteType.JournalEntry,
      text,
      readingStatus,
      creator: {
        connect: {
          id: userProfile.id,
        },
      },
      book: connectBookParams,
      bookRead: connectOrCreateBookReadParams,
      updatedAt: new Date(),
    },
  })

  let createdBookNote

  if (updateBookReadPromise) {
    ;[createdBookNote] = await prisma.$transaction([createBookNotePromise, updateBookReadPromise])
  } else {
    createdBookNote = await createBookNotePromise
  }

  if (like !== undefined) {
    const likeParams = {
      interactionType: InteractionType.Like,
      objectId: bookId,
      objectType: InteractionObjectType.Book,
      agentId: userProfile.id,
      agentType: InteractionAgentType.User,
    }

    if (like) {
      const existingLike = await prisma.interaction.findFirst({
        where: likeParams,
      })

      if (!existingLike) {
        await prisma.interaction.create({
          data: likeParams,
        })
      }
    } else {
      await prisma.interaction.deleteMany({
        where: likeParams,
      })
    }
  }

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
