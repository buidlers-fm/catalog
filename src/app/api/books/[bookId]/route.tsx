import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile } = params
  const { bookId } = routeParams

  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
    },
  })

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  const {
    title,
    subtitle,
    authorName,
    description,
    firstPublishedYear,
    isTranslated,
    originalTitle,
    wikipediaUrl,
  } = reqJson

  const fieldsToUpdate = {
    title,
    subtitle,
    authorName,
    description,
    firstPublishedYear,
    isTranslated,
    originalTitle,
    wikipediaUrl,
  }

  const changedFields: string[] = []
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (book[key] !== fieldsToUpdate[key]) {
      changedFields.push(key)
    }
  })

  if (changedFields.length === 0) {
    return NextResponse.json(reqJson, { status: 200 })
  }

  const updatedBook = await prisma.book.update({
    where: {
      id: bookId,
    },
    data: {
      ...fieldsToUpdate,
      edited: true,
    },
  })

  // create edit logs
  await prisma.editLog.create({
    data: {
      editorId: currentUserProfile.id,
      editedObjectId: bookId,
      editedObjectType: EditedObjectType.Book,
      editType: EditType.Update,
      beforeJson: book,
      afterJson: updatedBook,
      editedFields: changedFields,
    },
  })

  const resBody = humps.decamelizeKeys(updatedBook)

  return NextResponse.json(resBody, { status: 200 })
})
