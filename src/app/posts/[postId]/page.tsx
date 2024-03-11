import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import { decorateWithLikes, decorateWithComments, decorateWithSaves } from "lib/server/decorators"
import Post from "app/posts/[postId]/components/Post"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "post",
    params,
  })
}

export default async function PostPage({ params }) {
  const currentUserProfile = await getCurrentUserProfile()

  const { postId } = params

  let post = await prisma.bookNote.findFirst({
    where: {
      id: postId,
    },
    include: {
      creator: true,
      book: true,
    },
  })

  if (!post) notFound()
  ;[post] = await decorateWithLikes([post], InteractionObjectType.BookNote, currentUserProfile)
  ;[post] = await decorateWithComments([post], CommentParentType.Post, currentUserProfile)
  if (currentUserProfile)
    [post] = await decorateWithSaves([post], InteractionObjectType.BookNote, currentUserProfile)

  return <Post post={post} currentUserProfile={currentUserProfile} />
}
