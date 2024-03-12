import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "lib/server/auth"
import SavedItems from "app/components/SavedItems"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "saved items • catalog",
  openGraph: {
    title: "saved items • catalog",
  },
}

export default async function SavedPage() {
  const currentUserProfile = await getCurrentUserProfile({ requireSignedIn: true })
  const isSignedIn = !!currentUserProfile

  if (!isSignedIn) redirect("/")

  return (
    <div className="flex justify-center items-center flex-col">
      <SavedItems />
    </div>
  )
}
