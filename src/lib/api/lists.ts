import prisma from "lib/prisma"
import { reportToSentry } from "lib/sentry"
import { generateUniqueSlug, runInSequence, getAllAtMentions } from "lib/helpers/general"
import { findOrCreateBook } from "lib/api/books"
import { findOrCreateLike } from "lib/api/likes"
import { createNotifsFromMentions } from "lib/server/notifs"
import ListDesignation from "enums/ListDesignation"
import InteractionObjectType from "enums/InteractionObjectType"
import UserBookShelf from "enums/UserBookShelf"
import NotificationType from "enums/NotificationType"
import NotificationObjectType from "enums/NotificationObjectType"
import type Book from "types/Book"
import type Mention from "types/Mention"

const createList = async (params, userProfile) => {
  const {
    title: listTitle,
    description: listDescription,
    books: selectedBooks,
    slug: _listSlug,
    ranked: listRanked,
    designation,
    bookNotes = [],
  } = params

  // find existing books
  const existingBooks = await prisma.book.findMany({
    where: { openLibraryWorkId: { in: selectedBooks.map((b) => b.openLibraryWorkId) } },
  })

  // create books that don't exist
  const existingBookOpenlibraryWorkIds = existingBooks.map((b) => b.openLibraryWorkId)
  const selectedBooksToCreate: Book[] = selectedBooks.filter(
    (b) => !existingBookOpenlibraryWorkIds.includes(b.openLibraryWorkId),
  )

  const booksToCreatePromises = selectedBooksToCreate.map(async (selectedBook) => {
    const {
      title,
      authorName,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear,
      isTranslated,
      originalTitle,
    } = selectedBook

    return {
      slug: await generateUniqueSlug(`${title} ${authorName}`, "book"),
      title,
      authorName,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear: Number(firstPublishedYear),
      isTranslated,
      originalTitle,
    }
  })

  const booksToCreate = await Promise.all(booksToCreatePromises)

  await prisma.book.createMany({
    data: booksToCreate,
  })

  const selectedBookRecords = await prisma.book.findMany({
    where: { openLibraryWorkId: { in: selectedBooks.map((b) => b.openLibraryWorkId) } },
  })

  if (selectedBookRecords.length !== selectedBooks.length) {
    throw new Error(
      `Selected ${selectedBooks.length} books for list but ${selectedBookRecords.length} books found in db`,
    )
  }

  // create list + list item assignments as a transaction
  const listSlug =
    _listSlug || (await generateUniqueSlug(listTitle, "list", { ownerId: userProfile.id }))

  const orderedSelectedBookRecords = selectedBookRecords.sort((a, b) => {
    const indexOfA = selectedBooks.findIndex(
      (book) => book.openLibraryWorkId === a.openLibraryWorkId,
    )
    const indexOfB = selectedBooks.findIndex(
      (book) => book.openLibraryWorkId === b.openLibraryWorkId,
    )

    if (indexOfA === -1 || indexOfB === -1)
      throw new Error("fetched a book record that wasn't selected for the list")

    return indexOfA - indexOfB
  })

  const bookIdsToNotes = bookNotes.reduce((obj, item) => {
    obj[item.openLibraryWorkId] = item.note
    return obj
  }, {})

  const listItemAssignments = orderedSelectedBookRecords.map((book, idx) => ({
    listedObjectType: "book",
    listedObjectId: book.id,
    sortOrder: idx + 1,
    note: bookIdsToNotes[book.openLibraryWorkId!],
  }))

  const createdList = await prisma.list.create({
    data: {
      slug: listSlug,
      title: listTitle,
      description: listDescription,
      ranked: listRanked,
      designation,
      creatorId: userProfile.id,
      ownerId: userProfile.id,
      listItemAssignments: {
        createMany: {
          data: listItemAssignments,
        },
      },
    },
  })

  const allTexts = [listDescription || "", ...Object.values(bookIdsToNotes)]

  const atMentions = getAllAtMentions(allTexts.join(" "))

  const mentions: Mention[] = atMentions.map((atMention) => ({
    agentId: userProfile.id,
    objectId: createdList.id,
    objectType: NotificationObjectType.List,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  return createdList
}

const updateList = async (list, params, userProfile) => {
  const {
    title: listTitle,
    description: listDescription,
    ranked: listRanked,
    books: selectedBooks,
    bookNotes = [],
  } = params

  // find existing books
  const existingBooks = await prisma.book.findMany({
    where: { openLibraryWorkId: { in: selectedBooks.map((b) => b.openLibraryWorkId) } },
  })

  // create books that don't exist
  const existingBookOpenlibraryWorkIds = existingBooks.map((b) => b.openLibraryWorkId)
  const selectedBooksToCreate: Book[] = selectedBooks.filter(
    (b) => !existingBookOpenlibraryWorkIds.includes(b.openLibraryWorkId),
  )

  const booksToCreatePromises = selectedBooksToCreate.map(async (selectedBook) => {
    const {
      title,
      authorName,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear,
      isTranslated,
      originalTitle,
    } = selectedBook

    return {
      slug: await generateUniqueSlug(`${title} ${authorName}`, "book"),
      title,
      authorName,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear: Number(firstPublishedYear),
      isTranslated,
      originalTitle,
    }
  })

  const booksToCreate = await Promise.all(booksToCreatePromises)

  await prisma.book.createMany({
    data: booksToCreate,
  })

  const selectedBookRecords = await prisma.book.findMany({
    where: { openLibraryWorkId: { in: selectedBooks.map((b) => b.openLibraryWorkId) } },
  })

  if (selectedBookRecords.length !== selectedBooks.length) {
    throw new Error(
      `Selected ${selectedBooks.length} books for list but ${selectedBookRecords.length} books found in db`,
    )
  }

  // regenerate slug if title has changed
  let listSlug = list.slug
  if (listTitle && listTitle !== list.title) {
    listSlug = await generateUniqueSlug(listTitle, "list", { ownerId: userProfile.id })
  }

  // update list
  const updatedList = await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      slug: listSlug,
      title: listTitle,
      description: listDescription,
      ranked: listRanked,
    },
  })

  // delete + recreate list item assignments
  await prisma.listItemAssignment.deleteMany({
    where: {
      listId: list.id,
    },
  })

  const orderedSelectedBookRecords = selectedBookRecords.sort((a, b) => {
    const indexOfA = selectedBooks.findIndex(
      (book) => book.openLibraryWorkId === a.openLibraryWorkId,
    )
    const indexOfB = selectedBooks.findIndex(
      (book) => book.openLibraryWorkId === b.openLibraryWorkId,
    )

    if (indexOfA === -1 || indexOfB === -1)
      throw new Error("fetched a book record that wasn't selected for the list")

    return indexOfA - indexOfB
  })

  const bookIdsToNotes = bookNotes.reduce((obj, item) => {
    obj[item.openLibraryWorkId] = item.note
    return obj
  }, {})

  const listItemAssignments = orderedSelectedBookRecords.map((book, idx) => ({
    listId: list.id,
    listedObjectType: "book",
    listedObjectId: book.id,
    sortOrder: idx + 1,
    note: bookIdsToNotes[book.openLibraryWorkId!],
  }))

  await prisma.listItemAssignment.createMany({
    data: listItemAssignments,
  })

  // if list is a favorite list, create a like and add books to user's `read` list and shelf
  if (list.designation === ListDesignation.Favorite) {
    try {
      const createLikePromises = selectedBookRecords.map((book) =>
        findOrCreateLike({
          likedObjectType: InteractionObjectType.Book,
          likedObjectId: book.id,
          userProfile,
        }),
      )

      await createLikePromises

      const readList = await prisma.list.findFirst({
        where: {
          creatorId: userProfile.id,
          designation: ListDesignation.Read,
        },
      })

      const addBookPromises = orderedSelectedBookRecords.map(
        (book) => () => addBook(book, readList),
      )
      await runInSequence(addBookPromises)

      const existingShelfAssignments = await prisma.userBookShelfAssignment.findMany({
        where: {
          userProfileId: userProfile.id,
          bookId: {
            in: orderedSelectedBookRecords.map((book) => book.id),
          },
        },
      })

      const shelfAssignmentsToCreate = orderedSelectedBookRecords
        .filter((book) => !existingShelfAssignments.find((sa) => sa.bookId === book.id))
        .map((book) => ({
          bookId: book.id,
          userProfileId: userProfile.id,
          shelf: UserBookShelf.Read,
        }))

      const shelfAssignmentPromises = shelfAssignmentsToCreate.map((shelfAssignment) =>
        prisma.userBookShelfAssignment.create({
          data: shelfAssignment,
        }),
      )

      await Promise.all(shelfAssignmentPromises)
    } catch (error: any) {
      reportToSentry(error, {
        list,
        params,
        userProfile,
      })
    }
  }

  const allTexts = [listDescription || "", ...Object.values(bookIdsToNotes)]

  const atMentions = getAllAtMentions(allTexts.join(" "))

  const existingNotifs = await prisma.notification.findMany({
    where: {
      agentId: userProfile.id,
      objectId: updatedList.id,
      objectType: NotificationObjectType.List,
      type: NotificationType.Mention,
      notifiedUserProfileId: {
        in: atMentions.map((atMention) => atMention!.id),
      },
    },
  })

  const newAtMentions = atMentions.filter(
    (atMention) => !existingNotifs.find((n) => n.notifiedUserProfileId === atMention!.id),
  )

  const mentions: Mention[] = newAtMentions.map((atMention) => ({
    agentId: userProfile.id,
    objectId: updatedList.id,
    objectType: NotificationObjectType.List,
    mentionedUserProfileId: atMention!.id,
  }))

  await createNotifsFromMentions(mentions)

  return updatedList
}

const addBook = async (book, list) => {
  // check if book exists
  let persistedBook = await prisma.book.findFirst({
    where: { openLibraryWorkId: book.openLibraryWorkId },
  })

  // create book if it doesn't exist
  if (!persistedBook) {
    const {
      title,
      authorName,
      subtitle,
      description,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear,
      isTranslated,
      originalTitle,
    } = book

    const bookData = {
      slug: await generateUniqueSlug(`${title} ${authorName}`, "book"),
      title,
      authorName,
      subtitle,
      description,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      editionsCount,
      firstPublishedYear: Number(firstPublishedYear),
      isTranslated,
      originalTitle,
    }

    persistedBook = await findOrCreateBook(bookData)
  }

  const existingListItemAssignments = await prisma.listItemAssignment.findMany({
    where: {
      listId: list.id,
    },
    orderBy: {
      sortOrder: "desc",
    },
  })

  // check if book is already in list
  const existingListItemAssignmentForBook = existingListItemAssignments.find(
    (lta) => lta.listedObjectId === persistedBook!.id,
  )
  if (existingListItemAssignmentForBook) return existingListItemAssignmentForBook

  // create new list item assignment to add to the end of the list
  const lastItemInList = existingListItemAssignments[0]
  const sortOrder = (lastItemInList?.sortOrder || 0) + 1

  const listItemAssignment = {
    listId: list.id,
    listedObjectType: "book",
    listedObjectId: persistedBook.id,
    sortOrder,
  }

  const createdListItemAssignment = await prisma.listItemAssignment.create({
    data: listItemAssignment,
  })

  await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      updatedAt: new Date(),
    },
  })

  return createdListItemAssignment
}

const removeBook = async (bookId, list) => {
  const existingListItemAssignments = await prisma.listItemAssignment.findMany({
    where: {
      listId: list.id,
    },
    orderBy: {
      sortOrder: "asc",
    },
  })

  const existingListItemAssignmentForBook = existingListItemAssignments.find(
    (lta) => lta.listedObjectId === bookId,
  )

  if (!existingListItemAssignmentForBook) return

  const removedItemSortOrder = existingListItemAssignmentForBook.sortOrder

  const deletePromise = prisma.listItemAssignment.delete({
    where: {
      id: existingListItemAssignmentForBook.id,
    },
  })

  await prisma.$transaction([
    deletePromise,

    // re-assign sort order for remaining items
    prisma.$queryRaw`
      UPDATE "list_item_assignments"
      SET "sort_order" = "sort_order" - 1
      WHERE "sort_order" > ${removedItemSortOrder} AND "list_id" = ${list.id}::uuid
    `,
  ])
}

export { createList, updateList, addBook, removeBook }
