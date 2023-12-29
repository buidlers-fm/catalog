import { getMetadata } from "lib/server/metadata"
import AdminInvites from "app/admin/invites/components/AdminInvites"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "admin.invites",
    params,
  })
}

export default function AdminInvitesPage() {
  return <AdminInvites />
}
