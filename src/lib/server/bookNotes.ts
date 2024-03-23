import prisma from "lib/prisma"
import {
  decorateWithLikes,
  decorateWithComments,
  decorateWithSaves,
  decorateWithFollowing,
} from "lib/server/decorators"
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
  following?: boolean
  sort?: Sort
  moreFilters?: any
}) {
  const {
    currentUserProfile,
    bookId,
    userProfileId,
    noteTypes,
    limit: _limit,
    requireText,
    following,
    sort,
  } = params

  const moreFilters = params.moreFilters || {}

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

  let creatorIdFilter
  if (following) {
    if (!currentUserProfile)
      throw new Error("currentUserProfile must be provided to filter by following")

    // get following
    const [decoratedUserProfile] = await decorateWithFollowing([currentUserProfile])
    const followingIds = decoratedUserProfile.following.map((f) => f.id)

    creatorIdFilter = {
      in: followingIds,
    }
  } else {
    creatorIdFilter = userProfileId
  }

  if (sort && sort === Sort.Popular) {
    if (!bookId) throw new Error("bookId must be provided to sort by popular")
    if (userProfileId) throw new Error("cannot filter by userProfileId when sorting by popular")

    _bookNotes = await prisma.bookNote.findMany({
      where: {
        bookId,
        text: textParams,
        noteType: noteTypeParams,
        ...moreFilters,
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
        creatorId: creatorIdFilter,
        ...moreFilters,
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

  // in practice this is always an array with 1 item because
  // querying for multiple types at once is deprecated, as a concept
  const noteType = noteTypes[0] as BookNoteType
  const objectType =
    noteType === BookNoteType.Post ? InteractionObjectType.Post : InteractionObjectType.Note

  let bookNotes = await decorateWithLikes(_bookNotes, objectType, currentUserProfile)

  const commentParentType = noteTypes.includes(BookNoteType.Post)
    ? CommentParentType.Post
    : CommentParentType.Note

  bookNotes = await decorateWithComments(bookNotes, commentParentType, currentUserProfile)

  if (currentUserProfile)
    bookNotes = await decorateWithSaves(bookNotes, objectType, currentUserProfile)

  return bookNotes
}

export { getBookNotes }
