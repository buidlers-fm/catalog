import Link from "next/link"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithLikes, decorateWithComments, decorateWithSaves } from "lib/server/decorators"
import NotesIndex from "app/home/components/NotesIndex"
import InteractionObjectType from "enums/InteractionObjectType"
import BookNoteType from "enums/BookNoteType"
import CommentParentType from "enums/CommentParentType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "explore notes • catalog",
  description: "Recent notes from around catalog.",
  openGraph: {
    title: "explore notes • catalog",
    description: "Recent notes from around catalog.",
  },
}

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

  notes = await decorateWithLikes(notes, InteractionObjectType.Note, currentUserProfile)
  notes = await decorateWithComments(notes, CommentParentType.Note, currentUserProfile)
  if (currentUserProfile)
    notes = await decorateWithSaves(notes, InteractionObjectType.Note, currentUserProfile)

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-page-title mb-4">
        <Link href="/explore" className="cat-link">
          explore
        </Link>
        {" / "}notes
      </div>
      <NotesIndex notes={notes} currentUserProfile={currentUserProfile} />
    </div>
  )
}
