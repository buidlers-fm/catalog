import Link from "next/link"
import { getCurrentUserProfile } from "lib/server/auth"
import NotesIndex from "app/home/components/NotesIndex"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "explore notes • catalog",
  description: "Recent notes from around catalog.",
  openGraph: {
    title: "explore notes • catalog",
    description: "Recent notes from around catalog.",
  },
}

export default async function RecentNotesPage() {
  const currentUserProfile = await getCurrentUserProfile()

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="cat-page-title mb-4">
        <Link href="/explore" className="cat-link">
          explore
        </Link>
        {" / "}notes
      </div>
      <NotesIndex currentUserProfile={currentUserProfile} />
    </div>
  )
}
