import { NextResponse } from "next/server"
import humps from "humps"
import validations from "lib/constants/validations"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { getBookNotes } from "lib/server/bookNotes"
import { findOrCreateBook } from "lib/api/books"
import { setUserBookShelf } from "lib/api/userBookShelves"
import { findOrCreateLike, deleteLikeByParams } from "lib/api/likes"
import { getAllAtMentions } from "lib/helpers/general"
import { createNotifsFromMentions } from "lib/server/notifs"
import BookNoteType from "enums/BookNoteType"
import BookNoteReadingStatus from "enums/BookNoteReadingStatus"
import BookReadStatus from "enums/BookReadStatus"
import UserBookShelf from "enums/UserBookShelf"
import InteractionObjectType from "enums/InteractionObjectType"
import NotificationObjectType from "enums/NotificationObjectType"
import Sort from "enums/Sort"
import type Mention from "types/Mention"
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
  const startDate = startDateStr ? new Date(startDateStr) : null
  const endDate = endDateStr ? new Date(endDateStr) : null

  let bookReadStatus
  if (readingStatus === BookNoteReadingStatus.Reading) {
    bookReadStatus = BookReadStatus.Started
  } else {
    bookReadStatus = readingStatus
  }

  const bookReadParams = {
    startDate,
    endDate,
    status: bookReadStatus,
    reader: {
      connect: {
        id: userProfile.id,
      },
    },
    book: connectBookParams,
  }

  const existingBookReadId = bookRead.id
  let connectOrCreateBookReadParams
  let updateBookReadPromise

  if (existingBookReadId) {
    connectOrCreateBookReadParams = {
      connect: {
        id: existingBookReadId,
      },
    }

    updateBookReadPromise = prisma.bookRead.update({
      where: {
        id: existingBookReadId,
      },
      data: {
        startDate,
        endDate,
        status: bookReadStatus,
      },
    })
  } else if (readingStatus === BookNoteReadingStatus.Started) {
    // create a book read
    connectOrCreateBookReadParams = {
      create: bookReadParams,
    }
  } else if (readingStatus === BookNoteReadingStatus.None) {
    // don't connect or create a book read
    connectOrCreateBookReadParams = undefined
  } else {
    // look for a matching book read. if found, connect it and update it. otherwise, create one.
    const lastUnfinishedBookRead = await prisma.bookRead.findFirst({
      where: {
        bookId: book.id,
        readerId: userProfile.id,
        status: BookReadStatus.Started,
      },
      orderBy: {
        createdAt: "desc",
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
          status: bookReadStatus,
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
    },
  })

  let createdBookNote

  if (updateBookReadPromise) {
    ;[createdBookNote] = await prisma.$transaction([createBookNotePromise, updateBookReadPromise])
  } else {
    createdBookNote = await createBookNotePromise
  }

  const statusToShelfMapping = {
    [BookNoteReadingStatus.Started]: UserBookShelf.CurrentlyReading,
    [BookNoteReadingStatus.Reading]: UserBookShelf.CurrentlyReading,
    [BookNoteReadingStatus.Finished]: UserBookShelf.Read,
    [BookNoteReadingStatus.Abandoned]: UserBookShelf.Abandoned,
  }

  if (readingStatus !== BookNoteReadingStatus.None) {
    await setUserBookShelf({
      book,
      shelf: statusToShelfMapping[readingStatus],
      userProfile,
    })
  }

  if (like !== undefined) {
    const likeParams = {
      likedObjectId: bookId,
      likedObjectType: InteractionObjectType.Book,
      userProfile,
    }

    if (like) {
      await findOrCreateLike(likeParams)
    } else {
      await deleteLikeByParams(likeParams)
    }
  }

  const atMentions = getAllAtMentions(text)

  const mentions: Mention[] = atMentions.map((atMention) => ({
    agentId: userProfile.id,
    objectId: createdBookNote.id,
    objectType: NotificationObjectType.BookNote,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
