import prisma from "lib/prisma"
import { getListLink, idsToObjects } from "lib/helpers/general"
import InteractionAgentType from "enums/InteractionAgentType"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import NotificationObjectType from "enums/NotificationObjectType"
import CommentParentType from "enums/CommentParentType"
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

  let _lists = lists.map((list: any) => ({
    ...list,
    books: list.listItemAssignments
      .map((lia) => (lia.listedObjectType === "book" ? bookIdsToBooks[lia.listedObjectId] : null))
      .filter((b) => !!b),
    url: getListLink(listIdsToOwners[list.id], list.slug),
    owner: listIdsToOwners[list.id],
  }))

  _lists = await decorateWithLikes(_lists, InteractionObjectType.List, currentUserProfile)
  _lists = await decorateWithComments(_lists, CommentParentType.List, currentUserProfile)
  if (currentUserProfile)
    _lists = await decorateWithSaves(_lists, InteractionObjectType.List, currentUserProfile)

  return _lists
}

export const decorateWithLikes = async (
  _objects: any[],
  objectType: InteractionObjectType,
  currentUserProfile?: UserProfileProps,
) => {
  let objects = _objects

  // decorate book note objects with whether creator liked the book
  if (objectType === InteractionObjectType.BookNote) {
    // all book note creators' likes of all the books (set might contain some irrelevant likes)
    const allCreatorBookLikes = await prisma.interaction.findMany({
      where: {
        objectId: {
          in: objects.map((obj) => obj.bookId),
        },
        objectType: InteractionObjectType.Book,
        interactionType: InteractionType.Like,
        agentId: {
          in: objects.map((obj) => obj.creatorId),
        },
        agentType: InteractionAgentType.User,
      },
    })

    objects = objects.map((obj) => ({
      ...obj,
      creatorLikedBook: allCreatorBookLikes.some(
        (like) => like.objectId === obj.bookId && like.agentId === obj.creatorId,
      ),
    }))
  }

  // fetch likes for these objects
  const allLikes = await prisma.interaction.findMany({
    where: {
      objectId: {
        in: objects.map((obj) => obj.id),
      },
      objectType,
      interactionType: InteractionType.Like,
      agentType: InteractionAgentType.User,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const allUserProfiles = await prisma.userProfile.findMany({
    where: {
      id: {
        in: allLikes.map((like) => like.agentId),
      },
    },
  })

  const allUserNamesById = allUserProfiles.reduce(
    (result, userProfile) => ({
      ...result,
      [userProfile.id]: userProfile.displayName || userProfile.username,
    }),
    {},
  )

  const objectIdsToLikerNames = allLikes.reduce(
    (result, like) => ({
      ...result,
      [like.objectId]: [...(result[like.objectId] || []), allUserNamesById[like.agentId]],
    }),
    {},
  )

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
    likeCount: objectIdsToLikerNames[obj.id]?.length || 0,
    likedByNames: objectIdsToLikerNames[obj.id] || [],
    currentUserLike: objectIdsToCurrentUserLikes[obj.id],
  }))
}

export const decorateWithSaves = async (
  items: any[],
  objectType: InteractionObjectType,
  currentUserProfile: UserProfileProps,
) => {
  const saves = await prisma.interaction.findMany({
    where: {
      agentId: currentUserProfile.id,
      agentType: InteractionAgentType.User,
      interactionType: InteractionType.Save,
      objectId: {
        in: items.map((item) => item.id),
      },
      objectType,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const savesByItemId = saves.reduce((result, save) => {
    result[save.objectId] = save.id
    return result
  }, {})

  return items.map((item) => ({
    ...item,
    saveId: savesByItemId[item.id],
  }))
}

function countComments(obj, depth = 0) {
  if (!obj.comments) return 0

  let count = obj.comments.length

  if (depth < 2) {
    obj.comments.forEach((c) => {
      count += countComments(c, depth + 1)
    })
  }

  return count
}

export const decorateComments = async (comments, currentUserProfile, depth = 0) => {
  const commenterIds = comments.map((comment) => comment.commenterId)

  const allCommenters = await prisma.userProfile.findMany({
    where: {
      id: {
        in: commenterIds,
      },
    },
  })

  const commenterIdsToCommenters = allCommenters.reduce(
    (result, commenter) => ({
      ...result,
      [commenter.id]: commenter,
    }),
    {},
  )

  const commentsWithLikes = await decorateWithLikes(
    comments,
    InteractionObjectType.Comment,
    currentUserProfile,
  )

  let finalComments = commentsWithLikes
  if (depth <= 2) {
    finalComments = await decorateWithComments(
      commentsWithLikes,
      CommentParentType.Comment,
      currentUserProfile,
      depth,
    )
  }

  if (currentUserProfile)
    finalComments = await decorateWithSaves(
      finalComments,
      InteractionObjectType.Comment,
      currentUserProfile,
    )

  return finalComments.map((comment) => ({
    ...comment,
    commenter: commenterIdsToCommenters[comment.commenterId],
  }))
}

export const decorateWithComments = async (
  objects,
  objectType: CommentParentType,
  currentUserProfile,
  depth = 0,
) => {
  const allComments = await prisma.comment.findMany({
    where: {
      parentId: {
        in: objects.map((obj) => obj.id),
      },
      parentType: objectType,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const decoratedComments = await decorateComments(allComments, currentUserProfile, depth + 1)

  const objectIdsToComments = decoratedComments.reduce(
    (result, comment) => ({
      ...result,
      [comment.parentId]: [...(result[comment.parentId] || []), comment],
    }),
    {},
  )

  const objectsWithComments = objects.map((obj) => ({
    ...obj,
    comments: objectIdsToComments[obj.id] || [],
  }))

  const objectsWithCommentCounts = objectsWithComments.map((obj) => ({
    ...obj,
    commentCount: countComments(obj),
  }))

  return objectsWithCommentCounts
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

export const decorateNotifs = async (notifs) => {
  const agentIds = notifs.map((notif) => notif.agentId)
  const notifiedUserProfileIds = notifs.map((notif) => notif.notifiedUserProfileId)

  const allAgents = await prisma.userProfile.findMany({
    where: {
      id: {
        in: agentIds,
      },
    },
  })

  const allCommentIds = notifs
    .filter(
      (n) =>
        n.objectType === NotificationObjectType.Comment ||
        n.sourceType === NotificationObjectType.Comment,
    )
    .map((n) => n.objectId)

  const allComments = await prisma.comment.findMany({
    where: {
      id: {
        in: allCommentIds,
      },
    },
  })

  const allBookNoteIdsFromNotifs = notifs
    .filter((n) => n.objectType === NotificationObjectType.BookNote)
    .map((n) => n.objectId)

  const allBookNoteIdsFromComments = allComments
    .filter(
      (c) =>
        c.rootObjectType === CommentParentType.Note || c.rootObjectType === CommentParentType.Post,
    )
    .map((c) => c.rootObjectId)

  const allBookNoteIds = [...allBookNoteIdsFromNotifs, ...allBookNoteIdsFromComments]

  const allBookNotes = await prisma.bookNote.findMany({
    where: {
      id: {
        in: allBookNoteIds,
      },
    },
  })

  const allListIdsFromNotifs = notifs
    .filter((n) => n.objectType === NotificationObjectType.List)
    .map((n) => n.objectId)

  const allListIdsFromComments = allComments
    .filter((c) => c.rootObjectType === CommentParentType.List)
    .map((c) => c.rootObjectId)

  const allListIds = [...allListIdsFromNotifs, ...allListIdsFromComments]

  const allLists = await prisma.list.findMany({
    where: {
      id: {
        in: allListIds,
      },
    },
  })

  const allNotifiedUserProfiles = await prisma.userProfile.findMany({
    where: {
      id: {
        in: notifiedUserProfileIds,
      },
    },
  })

  const agentIdsToAgents = idsToObjects(allAgents)
  const notifiedUserProfileIdsToNotifiedUserProfiles = idsToObjects(allNotifiedUserProfiles)
  const commentIdsToComments = idsToObjects(allComments)
  const bookNoteIdsToBookNotes = idsToObjects(allBookNotes)
  const listIdsToLists = idsToObjects(allLists)

  return notifs.map((notif) => {
    let object
    let source
    let rootObject
    let rootObjectType

    if (notif.objectType === NotificationObjectType.BookNote) {
      object = bookNoteIdsToBookNotes[notif.objectId]
    } else if (notif.objectType === NotificationObjectType.Comment) {
      object = commentIdsToComments[notif.objectId]
      if (
        object.rootObjectType === CommentParentType.Note ||
        object.rootObjectType === CommentParentType.Post
      ) {
        rootObject = bookNoteIdsToBookNotes[object.rootObjectId]
        rootObjectType = NotificationObjectType.BookNote
      } else if (object.rootObjectType === CommentParentType.List) {
        rootObject = listIdsToLists[object.rootObjectId]
        rootObjectType = NotificationObjectType.List
      }
    } else if (notif.objectType === NotificationObjectType.List) {
      object = listIdsToLists[notif.objectId]
    }

    if (notif.sourceType === NotificationObjectType.Comment) {
      source = commentIdsToComments[notif.sourceId]
    }

    return {
      ...notif,
      agent: agentIdsToAgents[notif.agentId],
      object,
      source,
      rootObject,
      rootObjectType,
      notifiedUser: notifiedUserProfileIdsToNotifiedUserProfiles[notif.notifiedUserProfileId],
    }
  })
}
