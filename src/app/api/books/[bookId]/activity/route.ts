import { NextResponse } from "next/server"
import humps from "humps"
import { validate as isValidUuid } from "uuid"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookActivity } from "lib/api/books"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams } = params
    const { bookId } = routeParams
    const currentUserProfile = await getCurrentUserProfile()

    if (!isValidUuid(bookId)) {
      return NextResponse.json({ error: "book id not valid" }, { status: 404 })
    }

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
      },
    })

    if (!book) {
      return NextResponse.json({ error: "book not found" }, { status: 404 })
    }

    const activity = await getBookActivity(book, currentUserProfile)

    const resBody = humps.decamelizeKeys(activity)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
