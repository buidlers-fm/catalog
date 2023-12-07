import { NextResponse } from "next/server"
import humps from "humps"
import validations from "app/constants/validations"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { generateUniqueSlug } from "lib/helpers/general"
import BookNoteType from "enums/BookNoteType"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { book, text, startDate: startDateStr, finishDate: finishDateStr, finished } = reqJson

  const bookNoteValidations = validations.bookNote

  if (text && text.length > bookNoteValidations.text.maxLength) {
    const errorMsg = `Text cannot be longer than ${bookNoteValidations.text.maxLength} characters.`
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  const bookNoteParams = {
    noteType: BookNoteType.JournalEntry,
    text,
    startDate: new Date(startDateStr),
    finishDate: new Date(finishDateStr),
    finished,
    creator: {
      connect: {
        id: userProfile.id,
      },
    },
    updatedAt: new Date(),
  }

  let createdBookNote

  // create book if needed
  if (book.id) {
    createdBookNote = await prisma.bookNote.create({
      data: {
        ...bookNoteParams,
        book: {
          connect: {
            id: book.id,
          },
        },
      },
    })
  } else {
    const {
      title,
      authorName,
      coverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear,
      isTranslated,
      originalTitle,
    } = book

    createdBookNote = await prisma.bookNote.create({
      data: {
        ...bookNoteParams,
        book: {
          create: {
            slug: await generateUniqueSlug(`${title} ${authorName}`, "book"),
            title,
            authorName,
            coverImageUrl,
            openLibraryWorkId,
            editionsCount,
            firstPublishedYear: Number(firstPublishedYear),
            isTranslated,
            originalTitle,
          },
        },
      },
    })
  }

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
