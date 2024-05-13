import { notFound } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import { isAdmin } from "lib/helpers/general"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }) {
  const currentUserProfile = await getCurrentUserProfile()

  if (!currentUserProfile) notFound()

  if (!isAdmin(currentUserProfile)) notFound()

  return (
    <div className="">
      <div className="cat-eyebrow-uppercase">admin</div>
      <hr className="my-1 w-3/4 h-[1px] border-none bg-gray-300" />

      {children}
    </div>
  )
}
