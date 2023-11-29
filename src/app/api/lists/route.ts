import { NextResponse } from "next/server"
import humps from "humps"
import { withApiHandling } from "lib/api/withApiHandling"
import { createList } from "lib/api/lists"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { title, description, ranked, books } = reqJson

  const listParams = { title, description, ranked, books }
  const createdList = await createList(listParams, userProfile)

  const resBody = humps.decamelizeKeys(createdList)

  return NextResponse.json(resBody, { status: 200 })
})
