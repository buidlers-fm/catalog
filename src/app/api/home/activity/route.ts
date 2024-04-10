import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { decorateWithFollowing } from "lib/server/decorators"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import Visibility from "enums/Visibility"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params

    if (!currentUserProfile) {
      return NextResponse.json({}, { status: 404 })
    }

    const includeQueryOptions = {
      bookShelfAssignments: {
        include: {
          userProfile: true,
          book: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      config: true,
    }

    const [decoratedUserProfile] = await decorateWithFollowing([currentUserProfile], {
      include: includeQueryOptions,
    })

    let friends = decoratedUserProfile.following

    // filter out friends whose shelves are not visible to the current user
    const allFriendsCurrentUserFollows = await prisma.interaction.findMany({
      where: {
        agentId: {
          in: friends.map(({ id }) => id),
        },
        interactionType: InteractionType.Follow,
        objectId: currentUserProfile.id,
        objectType: InteractionObjectType.User,
      },
    })

    friends = friends.filter((friend) => {
      const {
        config: { shelvesVisibility },
      } = friend

      if (shelvesVisibility === Visibility.Public || shelvesVisibility === Visibility.SignedIn) {
        return true
      }

      if (shelvesVisibility === Visibility.Self) return false

      // visibility is Friends
      const friendFollowsCurrentUser = allFriendsCurrentUserFollows.some(
        (follow) => follow.agentId === friend.id,
      )

      return friendFollowsCurrentUser
    })

    // array of friends with their respective shelf assignments,
    // sorted by most recently updated/created shelf assignment
    const friendsByLatestShelfAssignments = friends.sort((a, b) => {
      const aLatest = a.bookShelfAssignments[0]?.updatedAt || 0
      const bLatest = b.bookShelfAssignments[0]?.updatedAt || 0

      return new Date(bLatest).getTime() - new Date(aLatest).getTime()
    })

    // build array of latest shelf assignments, cycling through friends
    const LIMIT = 8
    let results: any[] = []
    let index = 0
    const totalShelfAssignments = friendsByLatestShelfAssignments.reduce(
      (acc, friend) => acc + friend.bookShelfAssignments.length,
      0,
    )

    while (results.length < LIMIT && results.length !== totalShelfAssignments) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      friendsByLatestShelfAssignments.forEach(({ bookShelfAssignments }) => {
        if (bookShelfAssignments[index] && results.length < LIMIT) {
          results.push(bookShelfAssignments[index])
        }
      })

      index += 1
    }

    // decorate with whether the friend liked the book
    const allLikes = await prisma.interaction.findMany({
      where: {
        agentId: {
          in: results.map((assignment) => assignment.userProfileId),
        },
        objectId: {
          in: results.map((assignment) => assignment.bookId),
        },
        interactionType: InteractionType.Like,
        objectType: InteractionObjectType.Book,
      },
    })

    const likerIdsByBookId = allLikes.reduce((acc, like) => {
      if (!acc[like.objectId]) {
        acc[like.objectId] = []
      }

      acc[like.objectId].push(like.agentId)

      return acc
    }, {})

    results = results.map((assignment) => ({
      ...assignment,
      likedByFriend: likerIdsByBookId[assignment.bookId]?.includes(assignment.userProfileId),
    }))

    const resBody = humps.decamelizeKeys(results)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false },
)
