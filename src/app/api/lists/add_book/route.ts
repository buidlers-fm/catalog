import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { addBook } from "lib/api/lists"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params

  // verify lists exist and belong to current user
  const { listIds, book } = reqJson

  const lists = await prisma.list.findMany({
    where: {
      id: { in: listIds },
    },
  })

  if (lists.length !== listIds.length) {
    const errorMsg = `${listIds.length} lists selected but ${lists.length} were found`
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }

  const listsBelongToUser = lists.every((list) => list.ownerId === userProfile.id)
  if (!listsBelongToUser) {
    const errorMsg = `You are not authorized to update all of the selected lists`
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }

  const persistedListItemAssignments: any[] = []
  // eslint-disable-next-line no-restricted-syntax
  for (const targetList of lists) {
    // eslint-disable-next-line no-await-in-loop
    const result = await addBook(book, targetList)
    persistedListItemAssignments.push(result)
  }

  const resBody = humps.decamelizeKeys(persistedListItemAssignments)

  return NextResponse.json(resBody, { status: 200 })
})
