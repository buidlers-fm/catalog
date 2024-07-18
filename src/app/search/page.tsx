import { notFound } from "next/navigation"
import humps from "humps"
import { getCurrentUserProfile } from "lib/server/auth"
import { searchExistingBooks, searchPeople, searchUsers } from "lib/server/search"
import RemountOnPathChange from "app/components/RemountOnPathChange"
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
  const currentUserProfile = await getCurrentUserProfile({ requireSignedIn: false })

  if (!query) notFound()

  const [people, books, users] = await Promise.all([
    searchPeople(query),
    searchExistingBooks(query),
    searchUsers(query, { currentUserProfile }),
  ])

  let initialResults = {
    people,
    books,
    users,
  }

  initialResults = humps.camelizeKeys(initialResults)

  return (
    <RemountOnPathChange
      ComponentToRemount={SearchResultsPage}
      searchString={query}
      initialResults={initialResults}
    />
  )
}
