import { notFound } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import { getBookNoteById } from "lib/server/bookNotes"
import Note from "app/notes/[noteId]/components/Note"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "note",
    params,
  })
}

export default async function NotePage({ params }) {
  const { noteId } = params

  const currentUserProfile = await getCurrentUserProfile()

  const note = await getBookNoteById(noteId, currentUserProfile)

  if (!note) notFound()

  return <Note note={note} currentUserProfile={currentUserProfile} />
}
