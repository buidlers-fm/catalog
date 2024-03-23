import { NextResponse } from "next/server"
import humps from "humps"
import { validate as isValidUuid } from "uuid"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { getCurrentUserProfile } from "lib/server/auth"
import { createList } from "lib/api/lists"
import { decorateLists, decorateWithFollowing } from "lib/server/decorators"
import type { NextRequest } from "next/server"

const FEATURED_LIST_TAG = "featured"

export const GET = withApiHandling(
  async (_req: NextRequest) => {
    const currentUserProfile = await getCurrentUserProfile()

    const userProfileId = _req.nextUrl.searchParams.get("user_profile_id") || undefined
    const bookId = _req.nextUrl.searchParams.get("book_id") || undefined
    const limit = _req.nextUrl.searchParams.get("limit")
      ? Number(_req.nextUrl.searchParams.get("limit"))
      : undefined
    const featured = _req.nextUrl.searchParams.get("featured") === "true"
    const following = _req.nextUrl.searchParams.get("following") === "true"

    if (bookId && !isValidUuid(bookId)) {
      return NextResponse.json({ error: "book_id is not a valid UUID" }, { status: 400 })
    }

    if (userProfileId && !isValidUuid(userProfileId)) {
      return NextResponse.json({ error: "user_profile_id is not a valid UUID" }, { status: 400 })
    }

    let whereQueryParams: any = {
      designation: null,
    }

    if (userProfileId) {
      whereQueryParams = {
        ...whereQueryParams,
        ownerId: userProfileId,
      }
    }

    if (bookId) {
      whereQueryParams = {
        ...whereQueryParams,
        listItemAssignments: {
          some: {
            listedObjectType: "book",
            listedObjectId: bookId,
          },
        },
      }
    }

    if (featured) {
      const featuredListTagAssignment = await prisma.tagAssignment.findFirst({
        where: {
          tag: FEATURED_LIST_TAG,
        },
      })

      if (featuredListTagAssignment) {
        whereQueryParams = {
          id: featuredListTagAssignment.taggedObjectId,
        }
      } else {
        return NextResponse.json([], { status: 200 })
      }
    }

    if (following) {
      if (!currentUserProfile)
        throw new Error("currentUserProfile must be provided to filter by following")

      // get following
      const [decoratedUserProfile] = await decorateWithFollowing([currentUserProfile])
      const followingIds = decoratedUserProfile.following.map((f) => f.id)

      whereQueryParams = {
        ...whereQueryParams,
        creatorId: {
          in: followingIds,
        },
      }
    }
    const _lists = await prisma.list.findMany({
      where: whereQueryParams,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      take: limit,
    })

    const lists = await decorateLists(_lists, currentUserProfile)

    const resBody = humps.decamelizeKeys(lists)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireSession: false, requireUserProfile: false },
)

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { title, description, ranked, books, bookNotes } = reqJson

  const listParams = { title, description, ranked, books, bookNotes }
  const createdList = await createList(listParams, userProfile)

  const resBody = humps.decamelizeKeys(createdList)

  return NextResponse.json(resBody, { status: 200 })
})
