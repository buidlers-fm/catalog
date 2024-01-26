import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { decorateComments } from "lib/server/decorators"
import { createNotifFromComment, createNotifsFromMentions } from "lib/server/notifs"
import { getAllAtMentions, commentParentTypeToNotificationObjectType } from "lib/helpers/general"
import CommenterType from "enums/CommenterType"
import CommentParentType from "enums/CommentParentType"
import NotificationSourceType from "enums/NotificationSourceType"
import type Comment from "types/Comment"
import type Mention from "types/Mention"
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

  let depth = 0
  let rootObjectId = parentId
  let rootObjectType = parentType

  if (parentType === CommentParentType.Comment) {
    const parentComment = await prisma.comment.findFirst({
      where: {
        id: parentId,
      },
    })

    if (!parentComment) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 400 })
    }

    depth = parentComment.depth + 1
    ;({ rootObjectId } = parentComment)
    ;({ rootObjectType } = parentComment)
  }

  const data: Comment = {
    text,
    commenterId: currentUserProfile.id,
    commenterType: CommenterType.UserProfile,
    parentType,
    parentId,
    rootObjectId,
    rootObjectType,
    depth,
  }

  // create notifs
  const newComment = await prisma.comment.create({
    data,
  })

  await createNotifFromComment(newComment)

  const atMentions = getAllAtMentions(text)

  const mentions: Mention[] = atMentions.map((atMention) => ({
    agentId: currentUserProfile.id,
    objectId: parentId,
    objectType: commentParentTypeToNotificationObjectType(parentType),
    sourceId: newComment.id,
    sourceType: NotificationSourceType.Comment,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  // return response
  const resBody = humps.decamelizeKeys(newComment)

  return NextResponse.json(resBody, { status: 200 })
})
