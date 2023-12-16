import { NextResponse } from "next/server"
import humps from "humps"
import { withApiHandling } from "lib/api/withApiHandling"
import { setUserBookShelf } from "lib/api/userBookShelves"
import UserBookShelf from "enums/UserBookShelf"
import type { NextRequest } from "next/server"

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

  const resBody = humps.decamelizeKeys(updatedUserBookShelfAssignment)

  return NextResponse.json(resBody, { status: 200 })
})
