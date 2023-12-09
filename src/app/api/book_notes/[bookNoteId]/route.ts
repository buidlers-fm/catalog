import { NextResponse } from "next/server"
import humps from "humps"
import validations from "app/constants/validations"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { routeParams, reqJson, currentUserProfile: userProfile } = params
  const { bookNoteId } = routeParams

  const bookNote = await prisma.bookNote.findFirst({
    where: {
      id: bookNoteId,
    },
  })

  if (bookNote?.creatorId !== userProfile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { text } = reqJson

  const bookNoteValidations = validations.bookNote

  if (text && text.length > bookNoteValidations.text.maxLength) {
    const errorMsg = `Text cannot be longer than ${bookNoteValidations.text.maxLength} characters.`
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  const updatedBookNote = await prisma.bookNote.update({
    where: {
      id: bookNoteId,
    },
    data: {
      text,
      updatedAt: new Date(),
    },
  })

  const resBody = humps.decamelizeKeys(updatedBookNote)

  return NextResponse.json(resBody, { status: 200 })
})

export const DELETE = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile: userProfile } = params
    const { bookNoteId } = routeParams

    const bookNote = await prisma.bookNote.findFirst({
      where: {
        id: bookNoteId,
      },
    })

    if (bookNote?.creatorId !== userProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.bookNote.delete({
      where: {
        id: bookNoteId,
      },
    })

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
