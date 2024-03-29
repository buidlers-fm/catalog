import RecsIndex from "app/inbox/components/RecsIndex"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "recs • catalog",
  openGraph: {
    title: "recs • catalog",
  },
}

export default async function RecsPage() {
  return (
    <div className="mt-8 max-w-xl mx-8 sm:mx-auto font-mulish">
      <RecsIndex />
    </div>
  )
}
