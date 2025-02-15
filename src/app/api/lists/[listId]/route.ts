import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { updateList } from "lib/api/lists"
import { reportToSentry } from "lib/sentry"
import NotificationObjectType from "enums/NotificationObjectType"
import InteractionObjectType from "enums/InteractionObjectType"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile: userProfile } = params

  // verify list exists and belongs to current user
  const { listId } = routeParams
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  })

  if (!list) return NextResponse.json({}, { status: 404 })
  if (list.ownerId !== userProfile.id) {
    return NextResponse.json(
      { error: "You are not authorized to update this list" },
      { status: 403 },
    )
  }

  const { title, description, ranked, books, bookNotes } = reqJson

  const updatedListParams = {
    title,
    description,
    ranked,
    books,
    bookNotes,
  }

  const updatedList = await updateList(list, updatedListParams, userProfile)

  const resBody = humps.decamelizeKeys(updatedList)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params

    // verify list exists and belongs to current user
    const { listId } = routeParams
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
      },
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    if (!list) return NextResponse.json({}, { status: 404 })

    if (list.ownerId !== userProfile.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this list" },
        { status: 403 },
      )
    }

    await prisma.list.delete({
      where: {
        id: listId,
      },
    })

    try {
      await prisma.notification.deleteMany({
        where: {
          objectId: listId,
          objectType: NotificationObjectType.List,
        },
      })

      await prisma.interaction.deleteMany({
        where: {
          objectId: listId,
          objectType: InteractionObjectType.List,
        },
      })
    } catch (error: any) {
      reportToSentry(error, {
        method: "api.lists.delete.delete_associated_objects",
        listId,
      })
    }

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
