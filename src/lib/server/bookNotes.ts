import { Prisma } from "@prisma/client"
import prisma from "lib/prisma"
import { decorateWithLikes } from "lib/server/decorators"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import Sort from "enums/Sort"
import type { UserProfileProps } from "lib/models/UserProfile"

// because prisma doesn't support interpolating logic, only values
const prismaQueries = {
  withBookId: (bookId, noteTypes, limit) => prisma.$queryRaw`
    select bn.id as id, COALESCE(COUNT(intr.id), 0) as likes_count
    from book_notes as bn
    left join interactions as intr 
    on bn.id = intr.object_id
    and intr.interaction_type = ${InteractionType.Like} 
    and intr.object_type = ${InteractionObjectType.BookNote}
    where bn.book_id::text = ${bookId}
      and bn.note_type in (${Prisma.join(noteTypes)})
    group by bn.id
    order by likes_count desc, bn.created_at desc
    limit ${limit};
  `,

  withUserProfileId: (userProfileId, noteTypes, limit) => prisma.$queryRaw`
    select bn.id as id, COALESCE(COUNT(intr.id), 0) as likes_count
    from book_notes as bn
    left join interactions as intr 
    on bn.id = intr.object_id
    and intr.interaction_type = ${InteractionType.Like} 
    and intr.object_type = ${InteractionObjectType.BookNote}
    where bn.creator_id::text = ${userProfileId}
      and bn.note_type in (${Prisma.join(noteTypes)})
    group by bn.id
    order by likes_count desc, bn.created_at desc
    limit ${limit};
  `,

  withBookIdAndRequireText: (bookId, noteTypes, limit) => prisma.$queryRaw`
    select bn.id as id, COALESCE(COUNT(intr.id), 0) as likes_count
    from book_notes as bn
    left join interactions as intr 
    on bn.id = intr.object_id
    and intr.interaction_type = ${InteractionType.Like} 
    and intr.object_type = ${InteractionObjectType.BookNote}
    where
      bn.book_id::text = ${bookId}
      and bn.text is not null and bn.text <> ''
      and bn.note_type in (${Prisma.join(noteTypes)})
    group by bn.id
    order by likes_count desc, bn.created_at desc
    limit ${limit};
  `,

  withUserProfileIdAndRequireText: (userProfileId, noteTypes, limit) => prisma.$queryRaw`
    select bn.id as id, COALESCE(COUNT(intr.id), 0) as likes_count
    from book_notes as bn
    left join interactions as intr 
    on bn.id = intr.object_id
    and intr.interaction_type = ${InteractionType.Like} 
    and intr.object_type = ${InteractionObjectType.BookNote}
    where
      bn.creator_id::text = ${userProfileId}
      and bn.text is not null and bn.text <> ''
      and bn.note_type in (${Prisma.join(noteTypes)})
    group by bn.id
    order by likes_count desc, bn.created_at desc
    limit ${limit};
  `,
}

async function getBookNotes(params: {
  currentUserProfile?: UserProfileProps
  bookId?: string
  userProfileId?: string
  noteTypes: string[]
  limit?: number
  requireText?: boolean
  sort?: Sort
}) {
  const {
    currentUserProfile,
    bookId,
    userProfileId,
    noteTypes,
    limit: _limit,
    requireText,
    sort,
  } = params

  const DEFAULT_LIMIT = 1000
  const limit = _limit || DEFAULT_LIMIT

  let prismaQueryRaw
  const bookNoteIdsToLikesCount: any = {}
  let whereFilter

  if (sort && sort === Sort.Popular) {
    console.log("sort is popular")
    if (bookId) {
      if (requireText) {
        console.log("bookId and requireText")
        prismaQueryRaw = prismaQueries.withBookIdAndRequireText(bookId, noteTypes, limit)
      } else {
        console.log("bookId and not requireText")
        prismaQueryRaw = prismaQueries.withBookId(bookId, noteTypes, limit)
      }
    } else if (userProfileId) {
      if (requireText) {
        console.log("userProfileId and requireText")
        prismaQueryRaw = prismaQueries.withUserProfileIdAndRequireText(
          userProfileId,
          noteTypes,
          limit,
        )
      } else {
        console.log("userProfileId and not requireText")
        prismaQueryRaw = prismaQueries.withUserProfileId(userProfileId, noteTypes, limit)
      }
    } else {
      throw new Error("bookId or userProfileId must be provided")
    }

    const mostPopularBookNotes: { id: string; likes_count: number }[] = await prismaQueryRaw

    mostPopularBookNotes.forEach((bn) => {
      bookNoteIdsToLikesCount[bn.id] = Number(bn.likes_count)
    })

    console.log(mostPopularBookNotes)

    const mostPopularBookNoteIds = Object.keys(bookNoteIdsToLikesCount)

    whereFilter = {
      id: {
        in: mostPopularBookNoteIds,
      },
    }
  } else {
    console.log("sort is not popular")
    // default sort (most recent; will be specified in the prisma call)
    whereFilter = {
      bookId,
      text: requireText
        ? {
            not: null,
            notIn: [""],
          }
        : undefined,
      creatorId: userProfileId,
    }
  }

  const _bookNotes = await prisma.bookNote.findMany({
    where: whereFilter,
    include: {
      creator: true,
      book: true,
      bookRead: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })

  if (sort === Sort.Popular) {
    _bookNotes.sort((a, b) => bookNoteIdsToLikesCount[b.id] - bookNoteIdsToLikesCount[a.id])
  }

  const bookNotes = await decorateWithLikes(
    _bookNotes,
    InteractionObjectType.BookNote,
    currentUserProfile,
  )

  return bookNotes
}

export { getBookNotes }
