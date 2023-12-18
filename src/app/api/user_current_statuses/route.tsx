import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { findOrCreateBook } from "lib/api/books"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { book: _book, text } = reqJson

  let book = _book
  let bookId = _book?.id
  let connectBookParams

  if (book) {
    if (!bookId) {
      const dbBook = await findOrCreateBook(_book)
      bookId = dbBook.id
      book = dbBook
    }

    connectBookParams = {
      connect: {
        id: bookId,
      },
    }
  }

  const deleteExistingUserCurrentStatuses = prisma.userCurrentStatus.deleteMany({
    where: {
      userProfileId: userProfile.id,
    },
  })

  const createUserCurrentStatus = prisma.userCurrentStatus.create({
    data: {
      text,
      userProfile: {
        connect: {
          id: userProfile.id,
        },
      },
      book: connectBookParams,
    },
  })

  const [, createdUserCurrentStatus] = await prisma.$transaction([
    deleteExistingUserCurrentStatuses,
    createUserCurrentStatus,
  ])

  const responseData = {
    ...createdUserCurrentStatus,
    book,
  }

  const resBody = humps.decamelizeKeys(responseData)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile: userProfile } = params

    await prisma.userCurrentStatus.deleteMany({
      where: {
        userProfileId: userProfile.id,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
