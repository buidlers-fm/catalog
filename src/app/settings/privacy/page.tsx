import { getCurrentUserProfile } from "lib/server/auth"
import PrivacySettings from "app/settings/privacy/components/PrivacySettings"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "privacy • settings • catalog",
  openGraph: {
    title: "privacy • settings • catalog",
  },
}

export default async function SettingsPrivacyPage() {
  const currentUserProfile = await getCurrentUserProfile({ requireSignedIn: true })

  return <PrivacySettings currentUserProfile={currentUserProfile} />
}
