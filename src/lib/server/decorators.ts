import prisma from "lib/prisma"
import { getListLink } from "lib/helpers/general"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import type Like from "types/Like"
import type { UserProfileProps } from "lib/models/UserProfile"

export const decorateLists = async (lists, currentUserProfile?) => {
  const allBookIds = lists
    .map((list) =>
      list.listItemAssignments
        .filter((lia) => lia.listedObjectType === "book")
        .map((lia) => lia.listedObjectId),
    )
    .flat()

  const allBooks = await prisma.book.findMany({
    where: {
      id: {
        in: allBookIds,
      },
    },
  })

  const bookIdsToBooks = allBooks.reduce((result, book) => ({ ...result, [book.id]: book }), {})

  const listOwners = await prisma.userProfile.findMany({
    where: {
      id: {
        in: lists.map((list) => list.ownerId),
      },
    },
  })

  const listIdsToOwners = lists.reduce((result, list) => {
    result[list.id] = listOwners.find((owner) => owner.id === list.ownerId)
    return result
  }, {})

  const _lists = lists.map((list: any) => ({
    ...list,
    books: list.listItemAssignments
      .map((lia) => (lia.listedObjectType === "book" ? bookIdsToBooks[lia.listedObjectId] : null))
      .filter((b) => !!b),
    url: getListLink(listIdsToOwners[list.id], list.slug),
    owner: listIdsToOwners[list.id],
  }))

  return decorateWithLikes(_lists, InteractionObjectType.List, currentUserProfile)
}

export const decorateWithLikes = async (
  objects: any[],
  objectType: InteractionObjectType,
  currentUserProfile?: UserProfileProps,
) => {
  let objectIdsToLikeCounts

  if (objectType === InteractionObjectType.BookNote) {
    // book notes already have likeCount, so use it
    objectIdsToLikeCounts = objects.reduce(
      (result, obj) => ({
        ...result,
        [obj.id]: obj.likeCount,
      }),
      {},
    )
  } else {
    // fetch like count per object
    const likeCounts = await prisma.interaction.groupBy({
      by: ["objectId"],
      where: {
        objectId: {
          in: objects.map((obj) => obj.id),
        },
        objectType,
        interactionType: InteractionType.Like,
      },
      _count: true,
    })

    objectIdsToLikeCounts = likeCounts.reduce(
      (result, likeCount) => ({ ...result, [likeCount.objectId]: likeCount._count }),
      {},
    )
  }

  // fetch current user's likes for these objects
  let currentUserLikes: Like[] = []
  if (currentUserProfile) {
    const currentUserLikeInteractions = await prisma.interaction.findMany({
      where: {
        objectId: {
          in: objects.map((obj) => obj.id),
        },
        objectType,
        interactionType: InteractionType.Like,
        agentId: currentUserProfile?.id,
        agentType: InteractionAgentType.User,
      },
    })

    currentUserLikes = currentUserLikeInteractions.map((interaction) => ({
      id: interaction.id,
      userId: interaction.agentId,
      likedObjectId: interaction.objectId,
      likedObjectType: interaction.objectType,
      createdAt: interaction.createdAt,
    }))
  }

  const objectIdsToCurrentUserLikes = currentUserLikes.reduce(
    (result, like) => ({ ...result, [like.likedObjectId]: like }),
    {},
  )

  return objects.map((obj) => ({
    ...obj,
    likeCount: objectIdsToLikeCounts[obj.id] || 0,
    currentUserLike: objectIdsToCurrentUserLikes[obj.id],
  }))
}

export const decorateWithFollowers = async (userProfiles) => {
  const allFollows = await prisma.interaction.findMany({
    where: {
      interactionType: InteractionType.Follow,
      objectId: {
        in: userProfiles.map((userProfile) => userProfile.id),
      },
      objectType: InteractionObjectType.User,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const followerIds = allFollows.map((follow) => follow.agentId)

  const allFollowers = await prisma.userProfile.findMany({
    where: {
      id: {
        in: followerIds,
      },
    },
  })

  const allFollowersById = Object.fromEntries(allFollowers.map((profile) => [profile.id, profile]))

  return userProfiles.map((userProfile) => ({
    ...userProfile,
    followers: allFollows
      .filter((follow) => follow.objectId === userProfile.id)
      .map((follow) => allFollowersById[follow.agentId])
      .filter((follower) => !!follower) as UserProfileProps[],
  }))
}

export const decorateWithFollowing = async (userProfiles, options: any = {}) => {
  const { include } = options

  const allFollows = await prisma.interaction.findMany({
    where: {
      interactionType: InteractionType.Follow,
      agentId: {
        in: userProfiles.map((userProfile) => userProfile.id),
      },
      objectType: InteractionObjectType.User,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const followingIds = allFollows.map((follow) => follow.objectId)

  const allFollowedProfiles = await prisma.userProfile.findMany({
    where: {
      id: {
        in: followingIds,
      },
    },
    include,
  })

  const allFollowingById = Object.fromEntries(
    allFollowedProfiles.map((profile) => [profile.id, profile]),
  )

  return userProfiles.map((userProfile) => ({
    ...userProfile,
    following: allFollows
      .filter((follow) => follow.agentId === userProfile.id)
      .map((follow) => allFollowingById[follow.objectId])
      .filter((followedUserProfile) => !!followedUserProfile) as UserProfileProps[],
  }))
}
