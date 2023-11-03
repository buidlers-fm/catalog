import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { addBook } from "lib/api/lists"
import type { NextRequest } from "next/server"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // auth check
    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
    )
    const { data, error: supabaseError } = await supabase.auth.getSession()
    if (supabaseError) throw supabaseError

    const { session } = humps.camelizeKeys(data)
    if (!session) throw new Error("No session found")

    // fetch profile id
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    if (!userProfile) throw new Error("User profile not found")

    // verify lists exist and belong to current user
    const { listIds, book } = humps.camelizeKeys(await req.json())

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
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
