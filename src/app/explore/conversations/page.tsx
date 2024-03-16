import Link from "next/link"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithLikes, decorateWithComments, decorateWithSaves } from "lib/server/decorators"
import PostsIndex from "app/home/components/PostsIndex"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
import BookNoteType from "enums/BookNoteType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "explore conversations • catalog",
  description: "Recent links from around catalog.",
  openGraph: {
    title: "explore conversations • catalog",
    description: "Recent links from around catalog.",
  },
}

const POSTS_LIMIT = 50

export default async function RecentPostsPage() {
  const currentUserProfile = await getCurrentUserProfile()

  let posts = await prisma.bookNote.findMany({
    where: {
      noteType: {
        in: [BookNoteType.Post],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      creator: true,
      book: true,
    },
    take: POSTS_LIMIT,
  })

  posts = await decorateWithLikes(posts, InteractionObjectType.Post, currentUserProfile)

  posts = await decorateWithComments(posts, CommentParentType.Post, currentUserProfile)

  if (currentUserProfile)
    posts = await decorateWithSaves(posts, InteractionObjectType.Post, currentUserProfile)

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-page-title mb-4">
        <Link href="/explore" className="cat-link">
          explore
        </Link>
        {" / "}conversations
      </div>
      <PostsIndex posts={posts} currentUserProfile={currentUserProfile} />
    </div>
  )
}
