import { NextResponse } from "next/server"
import humps from "humps"
import validations from "app/constants/validations"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { generateUniqueSlug } from "lib/helpers/general"
import BookNoteType from "enums/BookNoteType"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const queryParams = _req.nextUrl.searchParams
    const bookId = queryParams.get("book_id") || undefined
    const noteType = queryParams.get("note_type") || undefined
    const userProfileId = queryParams.get("user_profile_id") || undefined
    const limit = Number(queryParams.get("limit")) || undefined
    const requireText = queryParams.get("require_text") === "true"

    const bookNotes = await prisma.bookNote.findMany({
      where: {
        bookId,
        noteType,
        text: requireText
          ? {
              not: null,
              notIn: [""],
            }
          : undefined,
        creatorId: userProfileId,
      },
      include: {
        creator: true,
        book: true,
        bookRead: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    const resBody = humps.decamelizeKeys(bookNotes)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { bookNote, bookRead, book } = reqJson

  const { text, readingStatus } = bookNote

  const bookNoteValidations = validations.bookNote

  if (text && text.length > bookNoteValidations.text.maxLength) {
    const errorMsg = `Text cannot be longer than ${bookNoteValidations.text.maxLength} characters.`
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  // create book if needed
  let bookId = book.id
  if (!bookId) {
    const {
      title,
      authorName,
      coverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear,
      isTranslated,
      originalTitle,
    } = book

    const createdBook = await prisma.book.create({
      data: {
        slug: await generateUniqueSlug(`${title} ${authorName}`, "book"),
        title,
        authorName,
        coverImageUrl,
        openLibraryWorkId,
        editionsCount,
        firstPublishedYear: Number(firstPublishedYear),
        isTranslated,
        originalTitle,
      },
    })

    bookId = createdBook.id
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

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
