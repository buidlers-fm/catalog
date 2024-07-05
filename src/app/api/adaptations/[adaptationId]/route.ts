import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile } = params
  const { adaptationId } = routeParams

  const { type, title, dateString, year, tmdbUrl, letterboxdUrl, wikipediaUrl } = reqJson

  const adaptation = await prisma.adaptation.findFirst({
    where: {
      id: adaptationId,
    },
  })

  if (!adaptation) {
    return NextResponse.json({ error: "Adaptation not found" }, { status: 404 })
  }

  const adaptationParams = {
    type,
    title,
    dateString,
    year,
    tmdbUrl,
    letterboxdUrl,
    wikipediaUrl,
  }

  const updatedAdaptation = await prisma.adaptation.update({
    where: {
      id: adaptationId,
    },
    data: adaptationParams,
  })

  const before = adaptation
  const after = updatedAdaptation

  // create edit logs
  await prisma.editLog.create({
    data: {
      editorId: currentUserProfile.id,
      editedObjectId: adaptation.bookId,
      editedObjectType: EditedObjectType.Book,
      editType: EditType.AdaptationUpdate,
      beforeJson: before,
      afterJson: after,
      editedFields: ["adaptations"],
    },
  })

  const resBody = humps.decamelizeKeys(updatedAdaptation)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile } = params
    const { adaptationId } = routeParams

    const adaptation = await prisma.adaptation.findFirst({
      where: {
        id: adaptationId,
      },
      include: {
        book: {
          include: {
            adaptations: {
              orderBy: {
                year: "desc",
              },
            },
          },
        },
      },
    })

    if (!adaptation) {
      return NextResponse.json({ error: "Adaptation not found" }, { status: 404 })
    }

    await prisma.adaptation.delete({
      where: {
        id: adaptationId,
      },
    })

    const before = adaptation.book.adaptations
    const after = await prisma.adaptation.findMany({
      where: {
        bookId: adaptation.bookId,
      },
      orderBy: {
        year: "desc",
      },
    })

    // create edit logs
    await prisma.editLog.create({
      data: {
        editorId: currentUserProfile.id,
        editedObjectId: adaptation.bookId,
        editedObjectType: EditedObjectType.Book,
        editType: EditType.AdaptationDelete,
        beforeJson: before,
        afterJson: after,
        editedFields: ["adaptations"],
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
