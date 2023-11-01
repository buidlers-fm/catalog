import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { createList } from "lib/api/lists"
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

    // fetch profile by id
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    if (!userProfile) throw new Error("User profile not found")

    const { title, description, books } = humps.camelizeKeys(await req.json())

    const listParams = { title, description, books }
    const createdList = await createList(listParams, userProfile)

    const resBody = humps.decamelizeKeys(createdList)

    return NextResponse.json(resBody, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
