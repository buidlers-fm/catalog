import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import { decorateWithLikes, decorateWithComments } from "lib/server/decorators"
import Note from "app/notes/[noteId]/components/Note"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "note",
    params,
  })
}

export default async function NotePage({ params }) {
  const currentUserProfile = await getCurrentUserProfile()

  const { noteId } = params

  let note = await prisma.bookNote.findFirst({
    where: {
      id: noteId,
    },
    include: {
      creator: true,
      book: true,
    },
  })

  if (!note) notFound()
  ;[note] = await decorateWithLikes([note], InteractionObjectType.BookNote, currentUserProfile)
  ;[note] = await decorateWithComments([note], CommentParentType.BookNote, currentUserProfile)

  return <Note note={note} currentUserProfile={currentUserProfile} />
}
