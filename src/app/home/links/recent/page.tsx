import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithLikes } from "lib/server/decorators"
import PostsIndex from "app/home/components/PostsIndex"
import InteractionObjectType from "enums/InteractionObjectType"
import BookNoteType from "enums/BookNoteType"

export const dynamic = "force-dynamic"

const POSTS_LIMIT = 50

export default async function RecentPostsPage() {
  const currentUserProfile = await getCurrentUserProfile()

  let posts = await prisma.bookNote.findMany({
    where: {
      noteType: {
        in: [BookNoteType.LinkPost, BookNoteType.TextPost],
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

  posts = await decorateWithLikes(posts, InteractionObjectType.BookNote, currentUserProfile)

  return <PostsIndex posts={posts} currentUserProfile={currentUserProfile} />
}
