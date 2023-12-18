import prisma from "lib/prisma"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"

export async function findOrCreateLike({ likedObjectType, likedObjectId, userProfile }) {
  const existingLike = await prisma.interaction.findFirst({
    where: {
      objectId: likedObjectId,
      objectType: likedObjectType,
      agentId: userProfile.id,
      agentType: InteractionAgentType.User,
      interactionType: InteractionType.Like,
    },
  })

  if (existingLike) return existingLike

  let createdLike

  const createLikePromise = prisma.interaction.create({
    data: {
      interactionType: InteractionType.Like,
      objectId: likedObjectId,
      objectType: likedObjectType,
      agentId: userProfile.id,
      agentType: InteractionAgentType.User,
    },
  })

  if (likedObjectType === InteractionObjectType.BookNote) {
    const currentLikeCount = await prisma.interaction.count({
      where: {
        objectId: likedObjectId,
        interactionType: InteractionType.Like,
      },
    })

    const updateBookNoteLikeCount = prisma.bookNote.update({
      where: {
        id: likedObjectId,
      },
      data: {
        likeCount: currentLikeCount + 1,
      },
    })

    ;[createdLike] = await prisma.$transaction([createLikePromise, updateBookNoteLikeCount])
  } else {
    createdLike = await createLikePromise
  }

  return createdLike
}

export async function deleteLike(like) {
  const deleteLikePromise = prisma.interaction.delete({
    where: {
      id: like.id,
    },
  })

  if (like.objectType === InteractionObjectType.BookNote) {
    const currentLikeCount = await prisma.interaction.count({
      where: {
        objectId: like.objectId,
        interactionType: InteractionType.Like,
      },
    })

    const updateBookNoteLikeCount = prisma.bookNote.update({
      where: {
        id: like.objectId,
      },
      data: {
        likeCount: currentLikeCount - 1,
      },
    })

    await prisma.$transaction([deleteLikePromise, updateBookNoteLikeCount])
  } else {
    await deleteLikePromise
  }

  return true
}

export async function deleteLikeByParams({ likedObjectType, likedObjectId, userProfile }) {
  const deleteLikePromise = prisma.interaction.deleteMany({
    where: {
      interactionType: InteractionType.Like,
      objectId: likedObjectId,
      objectType: likedObjectType,
      agentId: userProfile.id,
      agentType: InteractionAgentType.User,
    },
  })

  if (likedObjectType === InteractionObjectType.BookNote) {
    const currentLikeCount = await prisma.interaction.count({
      where: {
        objectId: likedObjectId,
        interactionType: InteractionType.Like,
      },
    })

    const updateBookNoteLikeCount = prisma.bookNote.update({
      where: {
        id: likedObjectId,
      },
      data: {
        likeCount: currentLikeCount - 1,
      },
    })

    await prisma.$transaction([deleteLikePromise, updateBookNoteLikeCount])
  } else {
    await deleteLikePromise
  }
}
