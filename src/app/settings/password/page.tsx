import { getCurrentUserProfile } from "lib/server/auth"
import ResetPassword from "app/settings/password/components/ResetPassword"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "reset password • settings • catalog",
  openGraph: {
    title: "reset password • settings • catalog",
  },
}

export default async function SettingsPasswordPage() {
  await getCurrentUserProfile({ requireSignedIn: true })

  return <ResetPassword />
}
