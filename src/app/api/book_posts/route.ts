import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { findOrCreateBook } from "lib/api/books"
import BookNoteType from "enums/BookNoteType"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { title, linkUrl, noteType, book } = reqJson

  const validNoteTypes = [BookNoteType.LinkPost, BookNoteType.TextPost]

  if (!validNoteTypes.includes(noteType)) {
    return NextResponse.json({ error: "Invalid note type." }, { status: 400 })
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

  const createdBookNote = await prisma.bookNote.create({
    data: {
      noteType,
      title,
      linkUrl,
      creator: {
        connect: {
          id: userProfile.id,
        },
      },
      book: connectBookParams,
    },
  })

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
