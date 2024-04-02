import { validate as isValidUuid } from "uuid"
import humps from "humps"
import prisma from "lib/prisma"
import {
  decorateWithLikes,
  decorateWithComments,
  decorateWithSaves,
  decorateWithFollowing,
} from "lib/server/decorators"
import BookNoteType from "enums/BookNoteType"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import CommentParentType from "enums/CommentParentType"
import Sort from "enums/Sort"
import Visibility from "enums/Visibility"
import type BookNote from "types/BookNote"
import type { UserProfileProps } from "lib/models/UserProfile"

async function getNotes({
  currentUserProfile,
  bookId,
  limit,
  creatorIds,
  noteIds,
  sort,
}: {
  currentUserProfile?: UserProfileProps
  bookId?: string
  limit?: number
  creatorIds?: string[]
  noteIds?: string[]
  sort?: Sort
}) {
  // validate uuids and limit
  if (bookId && !isValidUuid(bookId)) throw new Error(`Invalid book id: ${bookId}`)
  if (creatorIds) {
    creatorIds.forEach((id) => {
      if (!isValidUuid(id)) throw new Error(`Invalid creator id: ${id}`)
    })
  }
  if (noteIds) {
    noteIds.forEach((id) => {
      if (!isValidUuid(id)) throw new Error(`Invalid note id: ${id}`)
    })
  }

  if (limit && typeof limit !== "number") throw new Error(`Invalid limit: ${limit}`)

  const query = `SELECT *
   FROM 
      book_notes
   WHERE 
      note_type = '${BookNoteType.JournalEntry}'
      AND text IS NOT NULL 
      AND text != '' 
      ${bookId ? `AND book_id = '${bookId}'` : ""}
      ${
        creatorIds && creatorIds.length > 0
          ? `AND creator_id IN (${creatorIds.map((creatorId) => `'${creatorId}'`).join(",")})`
          : ""
      }
      ${
        noteIds && noteIds.length > 0
          ? `AND id IN (${noteIds.map((noteId) => `'${noteId}'`).join(",")})`
          : ""
      }
    AND (
      visibility = '${Visibility.Public}' OR
      ${currentUserProfile ? `creator_id = '${currentUserProfile?.id}' OR` : ""}
      (visibility = '${Visibility.SignedIn}' AND ${!!currentUserProfile})
      ${
        currentUserProfile
          ? `
              OR (visibility = '${Visibility.Friends}' AND EXISTS (
                SELECT 1 FROM interactions 
                WHERE interaction_type = '${InteractionType.Follow}' 
                AND agent_id = book_notes.creator_id 
                AND object_type = '${InteractionObjectType.User}' 
                AND object_id = '${currentUserProfile?.id}'
              ))
            `
          : ""
      }
    )
   ORDER BY 
   ${sort === Sort.Popular ? "like_count DESC, created_at DESC" : "created_at DESC"}
   LIMIT ${limit};`

  const rawResults = await prisma.$queryRawUnsafe(query)
  const notes = humps.camelizeKeys(rawResults)

  // decorate notes with creator, book, and bookRead
  const allUserProfiles = await prisma.userProfile.findMany({
    where: {
      id: {
        in: notes.map((note) => note.creatorId),
      },
    },
  })

  const allUserProfilesById = allUserProfiles.reduce((acc, userProfile) => {
    acc[userProfile.id] = userProfile
    return acc
  }, {})

  const allBooks = await prisma.book.findMany({
    where: {
      id: {
        in: notes.map((note) => note.bookId),
      },
    },
  })

  const allBooksById = allBooks.reduce((acc, book) => {
    acc[book.id] = book
    return acc
  }, {})

  const allBookReads = await prisma.bookRead.findMany({
    where: {
      id: {
        in: notes.map((note) => note.bookReadId).filter(Boolean),
      },
    },
  })

  const allBookReadsById = allBookReads.reduce((acc, bookRead) => {
    acc[bookRead.id] = bookRead
    return acc
  }, {})

  return notes.map((note) => ({
    ...note,
    creator: allUserProfilesById[note.creatorId],
    book: allBooksById[note.bookId],
    bookRead: allBookReadsById[note.bookReadId],
  }))
}

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
    following,
    sort,
  } = params

  const moreFilters = params.moreFilters || {}

  const DEFAULT_LIMIT = 1000
  const limit = _limit || DEFAULT_LIMIT

  // in practice this is always an array with 1 item because
  // querying for multiple types at once is deprecated, as a concept
  const noteType = noteTypes[0] as BookNoteType

  let creatorIds
  if (following) {
    if (!currentUserProfile)
      throw new Error("currentUserProfile must be provided to filter by following")

    const [decoratedUserProfile] = await decorateWithFollowing([currentUserProfile])
    creatorIds = decoratedUserProfile.following.map((f) => f.id)
  } else if (userProfileId) {
    creatorIds = [userProfileId]
  }

  const creatorIdFilter = creatorIds ? { in: creatorIds } : undefined

  let _bookNotes

  if (noteType === BookNoteType.JournalEntry) {
    _bookNotes = await getNotes({
      currentUserProfile,
      bookId,
      creatorIds,
      noteIds: moreFilters.id?.in || undefined,
      limit,
      sort,
    })
  } else {
    // get posts
    // eslint-disable-next-line no-lonely-if
    if (sort && sort === Sort.Popular) {
      if (!bookId) throw new Error("bookId must be provided to sort by popular")
      if (userProfileId) throw new Error("cannot filter by userProfileId when sorting by popular")

      _bookNotes = await prisma.bookNote.findMany({
        where: {
          bookId,
          noteType: BookNoteType.Post,
          ...moreFilters,
        },
        include: {
          creator: true,
          book: true,
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
          noteType: BookNoteType.Post,
          creatorId: creatorIdFilter,
          ...moreFilters,
        },
        include: {
          creator: true,
          book: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      })
    }
  }

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

async function isNoteVisible(note: BookNote, currentUserProfile: UserProfileProps) {
  const { noteType, creatorId, visibility } = note

  if (noteType === BookNoteType.Post) return true
  if (creatorId === currentUserProfile?.id) return true

  switch (visibility) {
    case Visibility.Public:
      return true
    case Visibility.SignedIn:
      return !!currentUserProfile
    case Visibility.Friends:
      if (!currentUserProfile) return false

      return !!(await prisma.interaction.findFirst({
        where: {
          interactionType: InteractionType.Follow,
          agentId: creatorId,
          objectId: currentUserProfile.id,
          objectType: InteractionObjectType.User,
        },
      }))
    default:
      return false
  }
}

// note or post
async function getBookNoteById(noteId: string, currentUserProfile: UserProfileProps) {
  let bookNote = (await prisma.bookNote.findFirst({
    where: {
      id: noteId,
    },
    include: {
      creator: true,
      book: true,
      bookRead: true,
    },
  })) as BookNote

  if (!bookNote) return null

  const isVisible = await isNoteVisible(bookNote, currentUserProfile)

  if (!isVisible) return null

  const objectType =
    bookNote.noteType === BookNoteType.Post
      ? InteractionObjectType.Post
      : InteractionObjectType.Note

  ;[bookNote] = await decorateWithLikes([bookNote], objectType, currentUserProfile)
  ;[bookNote] = await decorateWithComments([bookNote], CommentParentType.Note, currentUserProfile)
  if (currentUserProfile)
    [bookNote] = await decorateWithSaves([bookNote], objectType, currentUserProfile)

  return bookNote
}

export { getBookNotes, isNoteVisible, getBookNoteById }
