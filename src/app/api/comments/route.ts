import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { decorateComments } from "lib/server/decorators"
import CommenterType from "enums/CommenterType"
import CommentParentType from "enums/CommentParentType"
import type Comment from "types/Comment"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params

    const queryParams = _req.nextUrl.searchParams
    const parentType = (queryParams.get("parent_type") as CommentParentType) || undefined
    const parentId = queryParams.get("parent_id") || undefined
    const commenterId = queryParams.get("commenter_id") || undefined
    const commenterType = (queryParams.get("commenter_type") as CommenterType) || undefined
    const limit = Number(queryParams.get("limit")) || undefined

    let comments = await prisma.comment.findMany({
      where: {
        parentType,
        parentId,
        commenterId,
        commenterType,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    })

    comments = await decorateComments(comments, currentUserProfile)

    const resBody = humps.decamelizeKeys(comments)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params
  const { text, parentType, parentId } = reqJson

  if (!Object.values(CommentParentType).includes(parentType)) {
    return NextResponse.json({ error: "Invalid parent type" }, { status: 400 })
  }

  let level = 0
  if (parentType === CommentParentType.Comment) {
    const parentComment = await prisma.comment.findFirst({
      where: {
        id: parentId,
      },
    })

    if (!parentComment) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 400 })
    }

    level = parentComment.level + 1
  }

  const data: Comment = {
    text,
    commenterId: currentUserProfile.id,
    commenterType: CommenterType.UserProfile,
    parentType,
    parentId,
    level,
  }

  const newComment = await prisma.comment.create({
    data,
  })

  const resBody = humps.decamelizeKeys(newComment)

  return NextResponse.json(resBody, { status: 200 })
})
