import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const bookId = _req.nextUrl.searchParams.get("book_id")

    if (!bookId) {
      return NextResponse.json({ error: "book_id is required" }, { status: 400 })
    }

    const adaptations = await prisma.adaptation.findMany({
      where: {
        bookId,
      },
      orderBy: {
        year: "desc",
      },
    })

    const resBody = humps.decamelizeKeys(adaptations)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params
  const { bookId, type, title, dateString, year, tmdbUrl, letterboxdUrl, wikipediaUrl } = reqJson

  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
    },
    include: {
      adaptations: {
        orderBy: {
          year: "desc",
        },
      },
    },
  })

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 400 })
  }

  const adaptationParams = {
    bookId,
    type,
    title,
    dateString,
    year,
    tmdbUrl,
    letterboxdUrl,
    wikipediaUrl,
  }

  const createdAdaptation = await prisma.adaptation.create({
    data: adaptationParams,
    include: {
      book: {
        include: {
          adaptations: {
            orderBy: {
              year: "desc",
            },
          },
        },
      },
    },
  })

  const before = book.adaptations
  const after = createdAdaptation.book.adaptations

  // create edit logs
  await prisma.editLog.create({
    data: {
      editorId: currentUserProfile.id,
      editedObjectId: bookId,
      editedObjectType: EditedObjectType.Book,
      editType: EditType.AdaptationCreate,
      beforeJson: JSON.stringify(before),
      afterJson: JSON.stringify(after),
      editedFields: ["adaptations"],
    },
  })

  const resBody = humps.decamelizeKeys(createdAdaptation)

  return NextResponse.json(resBody, { status: 200 })
})
