import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { updateList } from "lib/api/lists"
import type { NextRequest } from "next/server"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }) {
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

    // verify list exists and belongs to current user
    const { listId } = params
    const list = await prisma.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    if (!list) return NextResponse.json({}, { status: 404 })
    if (list.ownerId !== userProfile.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this list" },
        { status: 403 },
      )
    }

    const { title, description, books } = humps.camelizeKeys(await req.json())

    const updatedListParams = {
      title,
      description,
      books,
    }

    const updatedList = await updateList(list, updatedListParams, userProfile)

    const resBody = humps.decamelizeKeys(updatedList)

    return NextResponse.json(resBody, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
