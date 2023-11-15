import { cookies } from "next/headers"
import { cache } from "react"
import humps from "humps"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import prisma from "lib/prisma"

type Options = {
  requireSignedIn?: boolean
}

const defaultOptions = {
  requireSignedIn: false,
}

// prevents vercel error. ref: https://github.com/vercel/next.js/issues/49373
const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

const getCurrentUserProfile = async (options: Options = defaultOptions) => {
  const { requireSignedIn } = options

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const { session } = humps.camelizeKeys(data)

  if (!session && requireSignedIn) throw new Error("Session not found")

  let currentUserProfile
  if (session) {
    currentUserProfile = await prisma.userProfile.findFirst({
      where: {
        userId: session.user.id,
      },
    })
  }

  if (!currentUserProfile && requireSignedIn) throw new Error("User not found")

  return currentUserProfile
}

export { getCurrentUserProfile }
