import { NextResponse } from "next/server"
import humps from "humps"
import { PrismaClient } from "@prisma/client"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json()
    const { email, username, password } = humps.camelizeKeys(reqBody)

    // validations
    const matchingUsersCount = await prisma.user.count({ where: { email } })
    if (matchingUsersCount > 0) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 400 },
      )
    }

    const matchingProfilesCount = await prisma.userProfile.count({ where: { username } })
    if (matchingProfilesCount > 0) {
      return NextResponse.json(
        { error: "An account with that username already exists." },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      )
    }

    // create supabase-auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    })

    if (error) {
      throw error
    }

    console.log(data)

    const userId = data.user!.id

    // create app user
    const createUserRes = await prisma.user.create({
      data: {
        id: userId,
        email,
      },
    })

    console.log(createUserRes)

    // create profile
    const createProfileRes = await prisma.userProfile.create({
      data: {
        username,
        userId,
      },
    })

    console.log(createProfileRes)

    const resData = {
      email,
      username,
      userId,
    }

    const resBody = humps.decamelizeKeys(resData)
    return NextResponse.json(resBody, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
