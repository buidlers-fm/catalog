import prisma from "lib/prisma"
import { decorateWithLikes, decorateWithComments, decorateWithSaves } from "lib/server/decorators"
import BookNoteType from "enums/BookNoteType"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
import Sort from "enums/Sort"
import type { UserProfileProps } from "lib/models/UserProfile"

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

  let _bookNotes

  const textParams = requireText
    ? {
        not: null,
        notIn: [""],
      }
    : undefined

  const noteTypeParams = noteTypes
    ? {
        in: noteTypes,
      }
    : undefined

  if (sort && sort === Sort.Popular) {
    if (!bookId) throw new Error("bookId must be provided to sort by popular")
    if (userProfileId) throw new Error("cannot filter by userProfileId when sorting by popular")

    _bookNotes = await prisma.bookNote.findMany({
      where: {
        bookId,
        text: textParams,
        noteType: noteTypeParams,
      },
      include: {
        creator: true,
        book: true,
        bookRead: true,
      },
      orderBy: [
        {
          likeCount: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: limit,
    })
  } else {
    // default sort (most recent; will be specified in the prisma call)

    _bookNotes = await prisma.bookNote.findMany({
      where: {
        bookId,
        text: textParams,
        noteType: noteTypeParams,
        creatorId: userProfileId,
      },
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
  }

  let bookNotes = await decorateWithLikes(
    _bookNotes,
    InteractionObjectType.BookNote,
    currentUserProfile,
  )

  const commentParentType = noteTypes.includes(BookNoteType.Post)
    ? CommentParentType.Post
    : CommentParentType.Note

  bookNotes = await decorateWithComments(bookNotes, commentParentType, currentUserProfile)

  if (currentUserProfile)
    bookNotes = await decorateWithSaves(
      bookNotes,
      InteractionObjectType.BookNote,
      currentUserProfile,
    )

  return bookNotes
}

export { getBookNotes }
