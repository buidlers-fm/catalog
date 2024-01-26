import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { findOrCreateBook } from "lib/api/books"
import { getAllAtMentions } from "lib/helpers/general"
import { createNotifsFromMentions } from "lib/server/notifs"
import BookNoteType from "enums/BookNoteType"
import NotificationObjectType from "enums/NotificationObjectType"
import type Mention from "types/Mention"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { title, linkUrl, text, hasSpoilers, noteType, book } = reqJson

  if (noteType !== BookNoteType.Post) {
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
      text,
      hasSpoilers,
      creator: {
        connect: {
          id: userProfile.id,
        },
      },
      book: connectBookParams,
    },
  })

  const atMentions = getAllAtMentions(text)

  const mentions: Mention[] = atMentions.map((atMention) => ({
    agentId: userProfile.id,
    objectId: createdBookNote.id,
    objectType: NotificationObjectType.BookNote,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  const resBody = humps.decamelizeKeys(createdBookNote)

  return NextResponse.json(resBody, { status: 200 })
})
