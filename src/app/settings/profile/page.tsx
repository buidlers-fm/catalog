import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import humps from "humps"
import EditProfile from "app/settings/profile/components/EditProfile"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function SettingsProfilePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const { session } = humps.camelizeKeys(data)
  if (!session) throw new Error("no session found")

  const userId = session.user.id

  const userProfileRes = await prisma.userProfile.findUnique({ where: { userId } })
  if (!userProfileRes) throw new Error("no profile found for user")

  const userProfile = humps.camelizeKeys(userProfileRes)

  return <EditProfile userProfile={userProfile} />
}
