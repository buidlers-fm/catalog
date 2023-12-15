import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params
    const queryParams = _req.nextUrl.searchParams
    const bookId = queryParams.get("book_id") || undefined
    const forCurrentUser = queryParams.get("for_current_user") === "true"

    if (!bookId && !forCurrentUser) {
      const errorMsg = "Must provide either book_id or for_current_user query param."
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    if (forCurrentUser && !currentUserProfile) {
      const errorMsg = "Must be logged in to get for_current_user book reads."
      return NextResponse.json({ error: errorMsg }, { status: 403 })
    }

    const bookReads = await prisma.bookRead.findMany({
      where: {
        bookId,
        readerId: forCurrentUser ? currentUserProfile.id : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const resBody = humps.decamelizeKeys(bookReads)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
