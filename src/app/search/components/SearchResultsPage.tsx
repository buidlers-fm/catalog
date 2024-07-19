"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { FaUserCircle } from "react-icons/fa"
import { TiWarningOutline } from "react-icons/ti"
import { reportToSentry } from "lib/sentry"
import search from "lib/search/books"
import OpenLibrary from "lib/openLibrary"
import {
  sortSearchResults,
  getBookLinkAgnostic,
  getPersonLinkAgnostic,
  getUserProfileLink,
} from "lib/helpers/general"
import LoadingSection from "app/components/LoadingSection"
import EmptyState from "app/components/EmptyState"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"
import type Book from "types/Book"

enum SearchFilter {
  All = "all",
  Books = "books",
  People = "people",
  Users = "users",
}

const OL_SEARCH_RESULTS_LIMIT = 20

function concatUniqueBookResults(resultsA, resultsB) {
  // resultsA has priority
  const uniqueResultsB = resultsB.filter(
    (bookB) => !resultsA.find((bookA) => bookA.openLibraryWorkId === bookB.openLibraryWorkId),
  )

  return [...resultsA, ...uniqueResultsB]
}

export default function SearchResultsPage({ searchString, initialResults }) {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [booksSearchResults, setBooksSearchResults] = useState<any[]>(initialResults.books)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<SearchFilter>(SearchFilter.All)

  const peopleSearchResults = initialResults.people
  const usersSearchResults = initialResults.users

  const searchBooks = useCallback(async () => {
    const existingBooksResults = initialResults.books

    let allOpenLibraryResults: any[] = []

    try {
      const { resultsForPage: openLibraryResults } = await OpenLibrary.search(searchString, {
        includeEditions: true,
        limit: OL_SEARCH_RESULTS_LIMIT,
      })

      allOpenLibraryResults = openLibraryResults
      allOpenLibraryResults = search.processResults(allOpenLibraryResults, searchString, {
        applyFuzzySearch: true,
      })

      // existing books always come first, followed by the openlibrary results
      const currentResults = concatUniqueBookResults(existingBooksResults, allOpenLibraryResults)

      setBooksSearchResults(currentResults)
    } catch (error: any) {
      if (error.message?.match(/json/i) || error.message?.match(/timed out/i)) {
        setErrorMessage(
          "Our search partner OpenLibrary may be experiencing issues. Try again later for better book results!",
        )
      }

      reportToSentry(error, { searchString })
    }
  }, [searchString, initialResults.books])

  useEffect(() => {
    async function searchAll() {
      setIsLoading(true)
      setErrorMessage(null)

      await searchBooks()
    }

    searchAll()
  }, [searchString, searchBooks])

  useEffect(() => {
    const _searchResults = [...booksSearchResults, ...peopleSearchResults, ...usersSearchResults]
    const sortedResults = sortSearchResults(_searchResults)
    setSearchResults(sortedResults)

    if (sortedResults.length > 0) {
      setIsLoading(false)
    }
  }, [booksSearchResults, peopleSearchResults, usersSearchResults])

  useEffect(() => {
    if (currentFilter === SearchFilter.All) {
      const _searchResults = [...booksSearchResults, ...peopleSearchResults, ...usersSearchResults]
      const sortedResults = sortSearchResults(_searchResults)
      setSearchResults(sortedResults)
    } else if (currentFilter === SearchFilter.Books) {
      setSearchResults(booksSearchResults)
    } else if (currentFilter === SearchFilter.People) {
      setSearchResults(peopleSearchResults)
    } else if (currentFilter === SearchFilter.Users) {
      setSearchResults(usersSearchResults)
    }
  }, [currentFilter, booksSearchResults, peopleSearchResults, usersSearchResults])

  return (
    <div className="mx-auto max-w-4xl px-8 flex">
      <div className="grow">
        <div className="cat-eyebrow-uppercase">results for "{searchString}"</div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />

        {errorMessage && (
          <div className="my-4 px-3 py-2 text-gray-300 font-mulish border border-gray-300 rounded">
            <TiWarningOutline className="inline-block -mt-1 mr-2 text-lg text-gold-500" />
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <LoadingSection />
        ) : (
          <div className="font-mulish">
            <div className="sm:hidden my-4">
              <div className="mb-2 cat-eyebrow">filter by</div>

              <select
                id="searchFiltersSelect"
                name="searchFiltersSelect"
                className="block w-full bg-gray-900 text-white rounded-md border-gray-300 py-2 pl-3 pr-10 focus:border-gold-500 focus:outline-none focus:ring-gold-500"
                defaultValue={SearchFilter.All}
                onChange={(e) => setCurrentFilter(e.target.value as SearchFilter)}
              >
                {Object.values(SearchFilter).map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>

            {searchResults.length > 0 ? (
              <div className="">
                {searchResults.map((result) => {
                  if (result.authorName) {
                    return <BookResult key={result.openLibraryWorkId} book={result} />
                  } else if (result.username) {
                    return <UserResult key={result.id} userProfile={result} />
                  } else {
                    return <PersonResult key={result.id} person={result} />
                  }
                })}
              </div>
            ) : (
              <EmptyState text="No results found." />
            )}
          </div>
        )}
      </div>

      <div className="hidden sm:block ml-8 font-mulish">
        <div className="cat-eyebrow-uppercase">show results for</div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />

        <div className="mt-4">
          {Object.values(SearchFilter).map((filter) => (
            <div
              className={`px-2 py-1 ${currentFilter === filter ? "bg-gray-900" : ""}`}
              key={filter}
            >
              <button key={filter} onClick={() => setCurrentFilter(filter)}>
                {filter}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BookResult({ book }: { book: Book }) {
  const { id, openLibraryWorkId, coverImageUrl, title, editionsCount, firstPublishedYear } = book

  const idForAnchor = id || openLibraryWorkId

  return (
    <div className="px-2 py-6 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        <div id={`book-${idForAnchor}`} className="w-16 mr-6 shrink-0">
          <div className="relative group">
            <Link href={getBookLinkAgnostic(book)}>
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="cover"
                  className="w-full mx-auto shadow-md rounded-xs"
                />
              ) : (
                <CoverPlaceholder size="sm" />
              )}
            </Link>

            <BookCoverOverlay book={book} positionClass="bottom-1" />
          </div>
        </div>

        <BookTooltip book={book} anchorSelect={`#book-${idForAnchor}`} />

        <div className="grow flex flex-col justify-between">
          <div className="">
            <Link href={getBookLinkAgnostic(book)}>{title}</Link>
            <div className="text-gray-300">by {book.authorName}</div>
            <div className="mt-1 text-gray-300 text-sm">
              {editionsCount} editions • {firstPublishedYear}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
function PersonResult({ person }) {
  const { name, imageUrl, title, orgName } = person

  return (
    <div className="px-2 py-6 flex border-b-[1px] border-b-gray-800 last:border-none">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="mr-2 w-[64px] h-[64px] rounded-full" />
      ) : (
        <FaUserCircle className="shrink-0 mr-2 text-[64px] text-gold-100" />
      )}
      <div className="ml-3 flex flex-col justify-center">
        <div>
          <Link href={getPersonLinkAgnostic(person)}>{name}</Link>
        </div>
        {title && <div className="text-gray-300 text-sm">{title}</div>}
        {orgName && <div className="text-gray-300 text-sm">{orgName}</div>}
        {!title && !orgName && <div className="text-gray-300 text-sm">Person</div>}
      </div>
    </div>
  )
}

function UserResult({ userProfile }) {
  const { avatarUrl, displayName, username } = userProfile

  return (
    <div className="px-2 py-6 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        {avatarUrl ? (
          <img src={avatarUrl} alt="user avatar" className="mr-2 w-[64px] h-[64px] rounded-full" />
        ) : (
          <FaUserCircle className="shrink-0 mr-2 text-[64px] text-gold-100" />
        )}
        <div className="ml-3">
          <Link href={getUserProfileLink(username)}>
            {displayName ? (
              <div className="">
                <div>{displayName}</div>
                <div className="text-gray-300 text-sm">@{username}</div>
              </div>
            ) : (
              <div className="mt-3">
                <div>@{username}</div>
              </div>
            )}
          </Link>
          <div className="text-gray-300 text-sm">catalog user</div>
        </div>
      </div>
    </div>
  )
}
