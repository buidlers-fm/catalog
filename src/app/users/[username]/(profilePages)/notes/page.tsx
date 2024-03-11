import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithComments, decorateWithLikes, decorateWithSaves } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import UserBookNotesIndex from "app/users/[username]/(profilePages)/notes/components/UserBookNotesIndex"
import CommentParentType from "enums/CommentParentType"
import InteractionObjectType from "enums/InteractionObjectType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.notes",
    params,
  })
}

export default async function UserBookNotesPage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
    include: {
      bookNotes: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          creator: true,
          book: true,
        },
      },
    },
  })

  if (!userProfile) notFound()

  userProfile.bookNotes = await decorateWithLikes(
    userProfile.bookNotes,
    InteractionObjectType.BookNote,
    currentUserProfile,
  )
  userProfile.bookNotes = await decorateWithComments(
    userProfile.bookNotes,
    CommentParentType.Note,
    currentUserProfile,
  )
  if (currentUserProfile)
    userProfile.bookNotes = await decorateWithSaves(
      userProfile.bookNotes,
      InteractionObjectType.BookNote,
      currentUserProfile,
    )

  return <UserBookNotesIndex userProfile={userProfile} currentUserProfile={currentUserProfile} />
}
