import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithLikes, decorateWithComments, decorateWithSaves } from "lib/server/decorators"
import NotesIndex from "app/home/components/NotesIndex"
import InteractionObjectType from "enums/InteractionObjectType"
import BookNoteType from "enums/BookNoteType"
import CommentParentType from "enums/CommentParentType"

export const dynamic = "force-dynamic"

const NOTES_LIMIT = 50

export default async function RecentNotesPage() {
  const currentUserProfile = await getCurrentUserProfile()

  let notes = await prisma.bookNote.findMany({
    where: {
      noteType: BookNoteType.JournalEntry,
      text: {
        not: null,
        notIn: [""],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      creator: true,
      book: true,
    },
    take: NOTES_LIMIT,
  })

  notes = await decorateWithLikes(notes, InteractionObjectType.BookNote, currentUserProfile)
  notes = await decorateWithComments(notes, CommentParentType.Note, currentUserProfile)
  if (currentUserProfile)
    notes = await decorateWithSaves(notes, InteractionObjectType.BookNote, currentUserProfile)

  return <NotesIndex notes={notes} currentUserProfile={currentUserProfile} />
}
