import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { generateUniqueSlug } from "lib/helpers/general"
import BookNoteType from "enums/BookNoteType"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const queryParams = _req.nextUrl.searchParams
    const bookId = queryParams.get("book_id") || undefined
    const noteType = queryParams.get("note_type") || {
      in: [BookNoteType.LinkPost, BookNoteType.TextPost],
    }
    const userProfileId = queryParams.get("user_profile_id") || undefined
    const limit = Number(queryParams.get("limit")) || undefined

    const bookNotes = await prisma.bookNote.findMany({
      where: {
        bookId,
        noteType,
        creatorId: userProfileId,
      },
      include: {
        creator: true,
        book: true,
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
  const { title, linkUrl, noteType, book } = reqJson

  const validNoteTypes = [BookNoteType.LinkPost, BookNoteType.TextPost]

  if (!validNoteTypes.includes(noteType)) {
    return NextResponse.json({ error: "Invalid note type." }, { status: 400 })
  }

  // create book if needed
  let bookId = book.id
  if (!bookId) {
    const {
      title: bookTitle,
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
        title: bookTitle,
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
      updatedAt: new Date(),
    },
  })

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
