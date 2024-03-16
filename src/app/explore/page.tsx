import ExplorePageComponent from "app/explore/components/ExplorePageComponent"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "explore • catalog",
  description: "Explore the latest from around catalog.",
  openGraph: {
    title: "explore • catalog",
    description: "Explore the latest from around catalog.",
  },
}

export default async function ExplorePage() {
  return <ExplorePageComponent />
}
