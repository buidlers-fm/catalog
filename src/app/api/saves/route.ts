import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookNotes } from "lib/server/bookNotes"
import { decorateLists, decorateComments } from "lib/server/decorators"
import BookNoteType from "enums/BookNoteType"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async () => {
    const currentUserProfile = await getCurrentUserProfile({ requireSignedIn: true })

    const saves = await prisma.interaction.findMany({
      where: {
        interactionType: InteractionType.Save,
        agentId: currentUserProfile.id,
        agentType: InteractionAgentType.User,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const savedListIds = saves
      .filter((save) => save.objectType === InteractionObjectType.List)
      .map((save) => save.objectId)

    async function getSavedLists() {
      let savedLists = await prisma.list.findMany({
        where: {
          id: {
            in: savedListIds,
          },
        },
        include: {
          listItemAssignments: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      })

      savedLists = await decorateLists(savedLists, currentUserProfile)

      return savedLists.reduce((acc, list) => {
        acc[list.id] = list
        return acc
      }, {})
    }

    async function getSavedNotes() {
      const savedNoteIds = saves
        .filter((save) => save.objectType === InteractionObjectType.Note)
        .map((save) => save.objectId)

      const savedNotes = await getBookNotes({
        noteTypes: [BookNoteType.JournalEntry],
        moreFilters: {
          id: {
            in: savedNoteIds,
          },
        },
        currentUserProfile,
      })

      return savedNotes.reduce((acc, note) => {
        acc[note.id] = note
        return acc
      }, {})
    }

    async function getSavedPosts() {
      const savedPostIds = saves
        .filter((save) => save.objectType === InteractionObjectType.Post)
        .map((save) => save.objectId)

      const savedPosts = await getBookNotes({
        noteTypes: [BookNoteType.Post],
        moreFilters: {
          id: {
            in: savedPostIds,
          },
        },
        currentUserProfile,
      })

      return savedPosts.reduce((acc, post) => {
        acc[post.id] = post
        return acc
      }, {})
    }

    async function getSavedComments() {
      const savedCommentIds = saves
        .filter((save) => save.objectType === InteractionObjectType.Comment)
        .map((save) => save.objectId)

      let savedComments = await prisma.comment.findMany({
        where: {
          id: {
            in: savedCommentIds,
          },
        },
      })

      savedComments = await decorateComments(savedComments, currentUserProfile)

      return savedComments.reduce((acc, comment) => {
        acc[comment.id] = comment
        return acc
      }, {})
    }

    const promises = [getSavedLists(), getSavedNotes(), getSavedPosts(), getSavedComments()]

    const [savedListsById, savedNotesById, savedPostsById, savedCommentsById] = await Promise.all(
      promises,
    )

    const savedObjects = saves
      .map((save) => {
        let savedObject

        switch (save.objectType) {
          case InteractionObjectType.List:
            savedObject = savedListsById[save.objectId]
            break
          case InteractionObjectType.Note:
            savedObject = savedNotesById[save.objectId]
            break
          case InteractionObjectType.Post:
            savedObject = savedPostsById[save.objectId]
            break
          case InteractionObjectType.Comment:
            savedObject = savedCommentsById[save.objectId]
            break
          default:
            return null
        }

        if (!savedObject) return null

        return {
          ...savedObject,
          save,
        }
      })
      .filter(Boolean)

    const resBody = humps.decamelizeKeys(savedObjects)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { savedObjectId, savedObjectType } = reqJson
  const createParams = {
    agentId: userProfile.id,
    agentType: InteractionAgentType.User,
    interactionType: InteractionType.Save,
    objectId: savedObjectId,
    objectType: savedObjectType,
  }

  // upsert is used for findOrCreate in prisma
  // passing an empty object in the update param will make no changes if the record exists
  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#update-or-create-records
  const save = await prisma.interaction.upsert({
    where: { agentId_agentType_interactionType_objectId_objectType: createParams },
    create: createParams,
    update: {},
  })

  const resBody = humps.decamelizeKeys(save)

  return NextResponse.json(resBody, { status: 200 })
})
