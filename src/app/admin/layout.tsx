import { notFound } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import UserRole from "enums/UserRole"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }) {
  const currentUserProfile = await getCurrentUserProfile({ withRoles: true })

  if (!currentUserProfile) notFound()

  const roles = currentUserProfile.roleAssignments.map((roleAssignment) => roleAssignment.role)
  const isAdmin = roles.includes(UserRole.Admin)

  if (!isAdmin) notFound()

  return (
    <div className="">
      <div className="cat-eyebrow-uppercase">admin</div>
      <hr className="my-1 w-3/4 h-[1px] border-none bg-gray-300" />

      {children}
    </div>
  )
}
