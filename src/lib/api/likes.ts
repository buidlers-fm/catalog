import prisma from "lib/prisma"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionObjectType from "enums/InteractionObjectType"

enum UpdateLikeCountMode {
  Increment,
  Decrement,
}

const typesWithLikeCounts = [InteractionObjectType.BookNote, InteractionObjectType.Comment]

async function getUpdateLikeCountParams(mode, params: any = {}) {
  const { likedObjectType, likedObjectId } = params

  if (!likedObjectType || !likedObjectId) {
    throw new Error("likedObjectType and likedObjectId are required")
  }

  const currentLikeCount = await prisma.interaction.count({
    where: {
      objectId: likedObjectId,
      objectType: likedObjectType,
      interactionType: InteractionType.Like,
    },
  })

  const newLikeCount =
    mode === UpdateLikeCountMode.Increment ? currentLikeCount + 1 : currentLikeCount - 1

  const updateLikeCountParams = {
    where: {
      id: likedObjectId,
    },
    data: {
      likeCount: newLikeCount,
    },
  }

  return updateLikeCountParams
}

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

  // update objects that keep their own like counts
  if (typesWithLikeCounts.includes(likedObjectType)) {
    const updateLikeCountParams = await getUpdateLikeCountParams(UpdateLikeCountMode.Increment, {
      likedObjectType,
      likedObjectId,
    })

    let updateLikeCountPromise

    if (likedObjectType === InteractionObjectType.BookNote) {
      updateLikeCountPromise = prisma.bookNote.update(updateLikeCountParams)
    } else if (likedObjectType === InteractionObjectType.Comment) {
      updateLikeCountPromise = prisma.comment.update(updateLikeCountParams)
    }

    ;[createdLike] = await prisma.$transaction([createLikePromise, updateLikeCountPromise])
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

  // update objects that keep their own like counts
  if (typesWithLikeCounts.includes(like.objectType)) {
    const updateLikeCountParams = await getUpdateLikeCountParams(UpdateLikeCountMode.Decrement, {
      likedObjectType: like.objectType,
      likedObjectId: like.objectId,
    })

    let updateLikeCountPromise

    if (like.objectType === InteractionObjectType.BookNote) {
      updateLikeCountPromise = prisma.bookNote.update(updateLikeCountParams)
    } else if (like.objectType === InteractionObjectType.Comment) {
      updateLikeCountPromise = prisma.comment.update(updateLikeCountParams)
    }

    await prisma.$transaction([deleteLikePromise, updateLikeCountPromise])
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

  // update objects that keep their own like counts
  if (typesWithLikeCounts.includes(likedObjectType)) {
    const updateLikeCountParams = await getUpdateLikeCountParams(UpdateLikeCountMode.Decrement, {
      likedObjectType,
      likedObjectId,
    })

    let updateLikeCountPromise

    if (likedObjectType === InteractionObjectType.BookNote) {
      updateLikeCountPromise = prisma.bookNote.update(updateLikeCountParams)
    } else if (likedObjectType === InteractionObjectType.Comment) {
      updateLikeCountPromise = prisma.comment.update(updateLikeCountParams)
    }

    await prisma.$transaction([deleteLikePromise, updateLikeCountPromise])
  } else {
    await deleteLikePromise
  }
}
