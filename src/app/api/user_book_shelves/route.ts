import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { setUserBookShelf } from "lib/api/userBookShelves"
import { todayNoonUtc } from "lib/helpers/general"
import UserBookShelf from "enums/UserBookShelf"
import BookReadStatus from "enums/BookReadStatus"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const bookId = queryParams.get("book_id") || undefined

    if (!bookId) {
      const errorMsg = "book_id is required"
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const currentUserBookShelfAssignment = await prisma.userBookShelfAssignment.findFirst({
      where: {
        bookId,
        userProfileId: currentUserProfile.id,
      },
    })

    const resBody = humps.decamelizeKeys(currentUserBookShelfAssignment)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params
  const { book, shelf } = reqJson

  if (!book || !shelf) {
    const errorMsg = "book and shelf are required"
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  if (!Object.values(UserBookShelf).includes(shelf)) {
    const errorMsg = `shelf must be one of: ${Object.values(UserBookShelf).join(", ")}`
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  const updatedUserBookShelfAssignment = await setUserBookShelf({
    book,
    shelf,
    userProfile: currentUserProfile,
  })

  const { bookId } = updatedUserBookShelfAssignment

  const connectBookParams = {
    connect: {
      id: bookId,
    },
  }

  const connectReaderParams = {
    connect: {
      id: currentUserProfile.id,
    },
  }

  const shelfToBookReadStatus = {
    [UserBookShelf.ToRead]: undefined,
    [UserBookShelf.UpNext]: undefined,
    [UserBookShelf.CurrentlyReading]: BookReadStatus.Started,
    [UserBookShelf.Read]: BookReadStatus.Finished,
    [UserBookShelf.Abandoned]: BookReadStatus.Abandoned,
  }

  const bookReadStatus = shelfToBookReadStatus[shelf]

  if (bookReadStatus === BookReadStatus.Started) {
    await prisma.bookRead.create({
      data: {
        book: connectBookParams,
        reader: connectReaderParams,
        status: BookReadStatus.Started,
        startDate: todayNoonUtc(),
      },
    })
  } else if (
    bookReadStatus === BookReadStatus.Finished ||
    bookReadStatus === BookReadStatus.Abandoned
  ) {
    // look for a matching book read. if found, connect it and update it. otherwise, create one.
    const lastUnfinishedBookRead = await prisma.bookRead.findFirst({
      where: {
        bookId,
        readerId: currentUserProfile.id,
        status: BookReadStatus.Started,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (lastUnfinishedBookRead) {
      await prisma.bookRead.update({
        where: {
          id: lastUnfinishedBookRead.id,
        },
        data: {
          endDate: todayNoonUtc(),
          status: bookReadStatus,
        },
      })
    } else {
      // create a book read
      await prisma.bookRead.create({
        data: {
          book: connectBookParams,
          reader: connectReaderParams,
          status: bookReadStatus,
          startDate: todayNoonUtc(),
          endDate: todayNoonUtc(),
        },
      })
    }
  } else {
    // ToRead or UpNext: don't connect or create a book read
  }

  const resBody = humps.decamelizeKeys(updatedUserBookShelfAssignment)

  return NextResponse.json(resBody, { status: 200 })
})
