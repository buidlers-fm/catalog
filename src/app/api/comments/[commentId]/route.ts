import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile: userProfile } = params
  const { commentId } = routeParams

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
    },
  })

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  if (comment?.commenterId !== userProfile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { text } = reqJson

  const updatedcomment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      text,
    },
  })

  const resBody = humps.decamelizeKeys(updatedcomment)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params
    const { commentId } = routeParams

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (comment?.commenterId !== userProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
