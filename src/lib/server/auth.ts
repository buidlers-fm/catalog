import { cookies } from "next/headers"
import humps from "humps"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"

type Options = {
  requireSignedIn?: boolean
}

const defaultOptions = {
  requireSignedIn: false,
}

const prisma = new PrismaClient()

const getCurrentUserProfile = async (options: Options = defaultOptions) => {
  const { requireSignedIn } = options

  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const { session } = humps.camelizeKeys(data)

  if (!session && requireSignedIn) throw new Error("Session not found")

  const sessionUserId = session?.user?.id

  const currentUserProfile = await prisma.userProfile.findUnique({
    where: {
      userId: sessionUserId,
    },
  })

  if (!currentUserProfile && requireSignedIn) throw new Error("User not found")

  return currentUserProfile
}

export { getCurrentUserProfile }
