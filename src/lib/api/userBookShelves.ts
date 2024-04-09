import prisma from "lib/prisma"
import { findOrCreateBook } from "lib/api/books"
import { addBook, removeBook } from "lib/api/lists"
import UserBookShelf from "enums/UserBookShelf"
import ListDesignation from "enums/ListDesignation"
import Visibility from "enums/Visibility"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"

async function shelveBook({ book, shelf, userProfile }) {
  if (!book || !shelf) {
    throw new Error("book and status are required")
  }

  if (!Object.values(UserBookShelf).includes(shelf)) {
    throw new Error(`shelf must be one of: ${Object.values(UserBookShelf).join(", ")}`)
  }

  let bookId = book.id
  if (!bookId) {
    const createdBook = await findOrCreateBook(book)
    bookId = createdBook.id
  }

  const existingUserBookShelfAssignment = await prisma.userBookShelfAssignment.findFirst({
    where: {
      bookId,
      userProfileId: userProfile.id,
    },
  })

  let updatedUserBookShelfAssignment

  if (existingUserBookShelfAssignment) {
    updatedUserBookShelfAssignment = await prisma.userBookShelfAssignment.update({
      where: {
        id: existingUserBookShelfAssignment.id,
      },
      data: {
        shelf,
      },
    })
  } else {
    updatedUserBookShelfAssignment = await prisma.userBookShelfAssignment.create({
      data: {
        bookId,
        userProfileId: userProfile.id,
        shelf,
      },
    })
  }

  if (shelf === UserBookShelf.Read) {
    const readList = await prisma.list.findFirst({
      where: {
        creatorId: userProfile.id,
        designation: ListDesignation.Read,
      },
    })

    if (readList) {
      await addBook(book, readList)
    }
  }

  return updatedUserBookShelfAssignment
}

async function unshelveBook({ bookId, userProfile }) {
  if (!bookId || !userProfile) {
    throw new Error("bookId and userProfileId are required")
  }

  const existingUserBookShelfAssignment = await prisma.userBookShelfAssignment.findFirst({
    where: {
      bookId,
      userProfileId: userProfile.id,
    },
  })

  const isReadShelf = existingUserBookShelfAssignment?.shelf === UserBookShelf.Read

  await prisma.userBookShelfAssignment.deleteMany({
    where: {
      bookId,
      userProfileId: userProfile.id,
    },
  })

  if (isReadShelf) {
    const readList = await prisma.list.findFirst({
      where: {
        creatorId: userProfile.id,
        designation: ListDesignation.Read,
      },
    })

    if (readList) {
      await removeBook(bookId, readList)
    }
  }
}

async function areShelvesVisible(userProfile, currentUserProfile) {
  if (currentUserProfile && userProfile.id === currentUserProfile.id) return true

  let userConfig = userProfile.config

  if (!userConfig) {
    userConfig = await prisma.userConfig.findFirst({
      where: {
        userProfileId: userProfile.id,
      },
    })
  }

  if (userConfig.shelvesVisibility === Visibility.Public) return true

  if (userConfig.shelvesVisibility === Visibility.SignedIn && currentUserProfile) {
    return true
  }

  if (userConfig.shelvesVisibility === Visibility.Friends && currentUserProfile) {
    const userFollowsCurrentUser = !!(await prisma.interaction.findFirst({
      where: {
        interactionType: InteractionType.Follow,
        agentId: userProfile.id,
        objectId: currentUserProfile.id,
        objectType: InteractionObjectType.User,
      },
    }))

    return userFollowsCurrentUser
  }

  return false
}

export { shelveBook, unshelveBook, areShelvesVisible }
