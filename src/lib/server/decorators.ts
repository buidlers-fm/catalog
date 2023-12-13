import prisma from "lib/prisma"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import type Like from "types/Like"
import type { UserProfileProps } from "lib/models/UserProfile"

export const decorateWithLikes = async (
  objects: any[],
  objectType: InteractionObjectType,
  currentUserProfile?: UserProfileProps,
) => {
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

  const objectIdsToLikeCounts = likeCounts.reduce(
    (result, likeCount) => ({ ...result, [likeCount.objectId]: likeCount._count }),
    {},
  )

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
