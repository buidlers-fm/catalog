import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { generateUniqueSlug } from "lib/helpers/general"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"
import PersonBookRelationType from "enums/PersonBookRelationType"
import type Book from "types/Book"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (req: NextRequest, { params }) => {
  const { routeParams, currentUserProfile, reqJson } = params
  const { personId } = routeParams

  const { relationType, books } = reqJson

  if (!Object.values(PersonBookRelationType).includes(relationType)) {
    return NextResponse.json({ error: "Invalid relation type" }, { status: 400 })
  }

  const person = await prisma.person.findFirst({
    where: {
      id: personId,
    },
  })

  if (!person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 })
  }

  // create books that don't exist

  const existingBooks = await prisma.book.findMany({
    where: { openLibraryWorkId: { in: books.map((b) => b.openLibraryWorkId) } },
  })

  const existingBookOpenlibraryWorkIds = existingBooks.map((b) => b.openLibraryWorkId)
  const selectedBooksToCreate: Book[] = books.filter(
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

  const bookRecords = await prisma.book.findMany({
    where: { openLibraryWorkId: { in: books.map((b) => b.openLibraryWorkId) } },
  })

  if (bookRecords.length !== books.length) {
    throw new Error(
      `Selected ${books.length} books for person but ${bookRecords.length} books found in db`,
    )
  }

  // delete all existing person book relations and create new ones

  const existingPersonBookRelations = await prisma.personBookRelation.findMany({
    where: {
      personId,
      relationType,
    },
    include: {
      book: true,
    },
  })

  const deletePersonBookRelationsPromise = prisma.personBookRelation.deleteMany({
    where: {
      personId,
      relationType,
    },
  })

  const createPersonBookRelationsPromise = prisma.personBookRelation.createMany({
    data: bookRecords.map((book) => ({
      personId,
      bookId: book.id,
      relationType,
    })),
  })

  const updatePersonPromise = prisma.person.update({
    where: {
      id: personId,
    },
    data: {
      areBooksEdited: true,
    },
  })

  await prisma.$transaction([
    deletePersonBookRelationsPromise,
    createPersonBookRelationsPromise,
    updatePersonPromise,
  ])

  const newPersonBookRelations = await prisma.personBookRelation.findMany({
    where: {
      personId,
      relationType,
    },
    include: {
      book: true,
    },
  })

  await prisma.editLog.create({
    data: {
      editorId: currentUserProfile.id,
      editedObjectId: personId,
      editedObjectType: EditedObjectType.Person,
      editType: EditType.PersonBookRelations,
      beforeJson: existingPersonBookRelations,
      afterJson: newPersonBookRelations,
      editedFields: ["personBookRelations"],
    },
  })

  return NextResponse.json({}, { status: 200 })
}, {})
