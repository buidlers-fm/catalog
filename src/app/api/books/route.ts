import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const queryParams = _req.nextUrl.searchParams
    const openLibraryWorkId = queryParams.get("open_library_work_id") || undefined

    if (!openLibraryWorkId) {
      const errorMsg = "open_library_work_id is required"
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const book = await prisma.book.findFirst({
      where: {
        openLibraryWorkId: {
          equals: openLibraryWorkId,
          mode: "insensitive",
        },
      },
    })

    if (!book) {
      const errorMsg = "Book not found"
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    const resBody = humps.decamelizeKeys(book)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)
