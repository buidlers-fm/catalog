import { notFound } from "next/navigation"
import humps from "humps"
import SearchResultsPage from "app/search/components/SearchResultsPage"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { query } = humps.camelizeKeys(searchParams)

  if (!query) return {}

  const pageTitle = "search results • catalog"
  const pageDescription = "catalog is a space for book people."

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
    },
  }
}

export default async function SearchResults({ searchParams }) {
  const { query } = humps.camelizeKeys(searchParams)

  if (!query) notFound()

  return <SearchResultsPage searchString={query} />
}
