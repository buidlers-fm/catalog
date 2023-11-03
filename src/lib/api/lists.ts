import { PrismaClient } from "@prisma/client"
import { generateUniqueSlug } from "lib/helpers/general"
import type Book from "types/Book"

const prisma = new PrismaClient()

const createList = async (params, userProfile) => {
  const {
    title: listTitle,
    description: listDescription,
    books: selectedBooks,
    slug: _listSlug,
    designation,
  } = params

  // find existing books
  const existingBooks = await prisma.book.findMany({
    where: { openlibraryWorkId: { in: selectedBooks.map((b) => b.openlibraryWorkId) } },
  })

  // create books that don't exist
  const existingBookOpenlibraryWorkIds = existingBooks.map((b) => b.openlibraryWorkId)
  const selectedBooksToCreate: Book[] = selectedBooks.filter(
    (b) => !existingBookOpenlibraryWorkIds.includes(b.openlibraryWorkId),
  )

  const booksToCreatePromises = selectedBooksToCreate.map(async (selectedBook) => {
    const { title, by, coverImageUrl, openlibraryWorkId } = selectedBook

    return {
      slug: await generateUniqueSlug(`${title} ${by}`, "book"),
      title,
      authorName: by,
      coverImageUrl,
      openlibraryWorkId,
    }
  })

  const booksToCreate = await Promise.all(booksToCreatePromises)

  await prisma.book.createMany({
    data: booksToCreate,
  })

  const selectedBookRecords = await prisma.book.findMany({
    where: { openlibraryWorkId: { in: selectedBooks.map((b) => b.openlibraryWorkId) } },
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
      (book) => book.openlibraryWorkId === a.openlibraryWorkId,
    )
    const indexOfB = selectedBooks.findIndex(
      (book) => book.openlibraryWorkId === b.openlibraryWorkId,
    )

    if (indexOfA === -1 || indexOfB === -1)
      throw new Error("fetched a book record that wasn't selected for the list")

    return indexOfA - indexOfB
  })

  const listItemAssignments = orderedSelectedBookRecords.map((book, idx) => ({
    listedObjectType: "book",
    listedObjectId: book.id,
    sortOrder: idx + 1,
  }))

  const createdList = await prisma.list.create({
    data: {
      slug: listSlug,
      title: listTitle,
      description: listDescription,
      designation,
      creatorId: userProfile.id,
      ownerId: userProfile.id,
      listItemAssignments: {
        createMany: {
          data: listItemAssignments,
        },
      },
      updatedAt: new Date(),
    },
  })

  return createdList
}

const updateList = async (list, params, userProfile) => {
  const { title: listTitle, description: listDescription, books: selectedBooks } = params

  // find existing books
  const existingBooks = await prisma.book.findMany({
    where: { openlibraryWorkId: { in: selectedBooks.map((b) => b.openlibraryWorkId) } },
  })

  // create books that don't exist
  const existingBookOpenlibraryWorkIds = existingBooks.map((b) => b.openlibraryWorkId)
  const selectedBooksToCreate: Book[] = selectedBooks.filter(
    (b) => !existingBookOpenlibraryWorkIds.includes(b.openlibraryWorkId),
  )

  const booksToCreatePromises = selectedBooksToCreate.map(async (selectedBook) => {
    const { title, by, coverImageUrl, openlibraryWorkId } = selectedBook

    return {
      slug: await generateUniqueSlug(`${title} ${by}`, "book"),
      title,
      authorName: by,
      coverImageUrl,
      openlibraryWorkId,
    }
  })

  const booksToCreate = await Promise.all(booksToCreatePromises)

  await prisma.book.createMany({
    data: booksToCreate,
  })

  const selectedBookRecords = await prisma.book.findMany({
    where: { openlibraryWorkId: { in: selectedBooks.map((b) => b.openlibraryWorkId) } },
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
      updatedAt: new Date(),
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
      (book) => book.openlibraryWorkId === a.openlibraryWorkId,
    )
    const indexOfB = selectedBooks.findIndex(
      (book) => book.openlibraryWorkId === b.openlibraryWorkId,
    )

    if (indexOfA === -1 || indexOfB === -1)
      throw new Error("fetched a book record that wasn't selected for the list")

    return indexOfA - indexOfB
  })

  const listItemAssignments = orderedSelectedBookRecords.map((book, idx) => ({
    listId: list.id,
    listedObjectType: "book",
    listedObjectId: book.id,
    sortOrder: idx + 1,
  }))

  await prisma.listItemAssignment.createMany({
    data: listItemAssignments,
  })

  return updatedList
}

const addBook = async (book, list) => {
  // check if book exists
  let persistedBook = await prisma.book.findFirst({
    where: { openlibraryWorkId: book.openlibraryWorkId },
  })

  // create book if it doesn't exist
  if (!persistedBook) {
    const { title, by, coverImageUrl, openlibraryWorkId } = book

    const bookData = {
      slug: await generateUniqueSlug(`${title} ${by}`, "book"),
      title,
      authorName: by,
      coverImageUrl,
      openlibraryWorkId,
    }

    persistedBook = await prisma.book.create({
      data: bookData,
    })
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

  return createdListItemAssignment
}

export { createList, updateList, addBook }
