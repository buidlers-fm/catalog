import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { updateList } from "lib/api/lists"
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

  const { title, description, ranked, books } = reqJson

  const updatedListParams = {
    title,
    description,
    ranked,
    books,
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

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
