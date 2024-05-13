"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Combobox } from "@headlessui/react"
import { BsSearch } from "react-icons/bs"
import { GiOpenBook } from "react-icons/gi"
import { ThreeDotsScale } from "react-svg-spinners"
import debounce from "lodash.debounce"
import api from "lib/api"
import search from "lib/search/books"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { truncateString, prepStringForSearch } from "lib/helpers/strings"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import type Book from "types/Book"

const RESULTS_LIMIT = 5
const DEBOUNCE_THRESHOLD_MS = 500

type Props = {
  onSelect: (item: any, type: string) => any
  isNav?: boolean
  isMobileNav?: boolean
  disabled?: boolean
  disabledMessage?: string
  isSignedIn?: boolean
  placeholderText?: string
  maxHeightClass?: string
  inputWidthClass?: string
  resultsWidthClass?: string
}

const concatUniqueSearchResults = (resultsA, resultsB) => {
  // resultsA has priority
  const uniqueResultsB = resultsB.filter(
    (bookB) => !resultsA.find((bookA) => bookA.openLibraryWorkId === bookB.openLibraryWorkId),
  )

  return [...resultsA, ...uniqueResultsB]
}

export default function Search({
  onSelect,
  isNav = true,
  isMobileNav = false,
  disabled = false,
  disabledMessage,
  isSignedIn = false,
  placeholderText,
  maxHeightClass = "max-h-[calc(100vh-192px)]",
  inputWidthClass: _inputWidthClass = "w-full xs:w-96",
  resultsWidthClass: _resultsWidthClass = "w-full xs:w-96",
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchMode, setSearchMode] = useState<"books" | "users">("books")
  const [searchResults, setSearchResults] = useState<Partial<Book>[]>()
  const [userSearchResults, setUserSearchResults] = useState<any[]>()
  const [moreResultsExist, setMoreResultsExist] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>()
  const [selectedUser, setSelectedUser] = useState<any | null>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const debouncedSearchHandler = useMemo(() => {
    async function onSearchChange(e: any) {
      setErrorMessage(undefined)

      const searchString = e.target.value
      setMoreResultsExist(false)

      if (searchString.length === 0) {
        setSearchResults(undefined)
        setUserSearchResults(undefined)
        return
      }

      if (searchString.startsWith("@") && isNav && isSignedIn) {
        setSearchMode("users")
        const userSearchString = searchString.slice(1)
        await searchUsers(userSearchString)
      } else {
        setSearchMode("books")
        await searchBooks(searchString)
      }

      setIsSearching(false)
    }

    return debounce(onSearchChange, DEBOUNCE_THRESHOLD_MS)
  }, [isNav, isSignedIn])

  const searchUsers = async (searchString: string) => {
    setIsSearching(true)

    try {
      const results = await api.profiles.search(searchString)
      setUserSearchResults(results)
    } catch (error: any) {
      reportToSentry(error, { searchString })
    }
  }

  const searchBooks = async (_searchString: string) => {
    if (_searchString.length < 3) return

    const searchString = prepStringForSearch(_searchString)

    setIsSearching(true)

    let existingBooksResults: any[] = []
    try {
      existingBooksResults = await api.books.search(searchString)
      if (existingBooksResults.length > 0) {
        setSearchResults(existingBooksResults)
      }
    } catch (error: any) {
      reportToSentry(error, { searchString })
    }

    let allOpenLibraryResults: any[] = []
    let searchWithEditionsFinished = false

    try {
      const searchOpenLibrary = async () => {
        try {
          const { moreResultsExist: _moreResultsExist, resultsForPage: _results } =
            await OpenLibrary.search(searchString, { includeEditions: false, limit: RESULTS_LIMIT })

          // because this search's results are just placeholders until the
          // better, slower results come in
          if (searchWithEditionsFinished) return

          const results = search.processResults(_results, searchString, {
            applyFuzzySearch: false,
          })

          // apply limit for the results being rendered now, but don't apply limit
          // for results that will get processed along with the other results when
          // they come back, so that we have all results available
          allOpenLibraryResults = results
          let currentResults = concatUniqueSearchResults(existingBooksResults, results)
          currentResults = currentResults.slice(0, RESULTS_LIMIT)

          setSearchResults(currentResults)
          setMoreResultsExist(_moreResultsExist)
        } catch (error: any) {
          if (error.message?.match(/json/i) || error.message?.match(/timed out/i)) {
            setErrorMessage(
              "Our search partner OpenLibrary may be experiencing issues. Try again later for better results!",
            )
          }
          reportToSentry(error, {
            searchString,
            options: {
              includeEditions: false,
            },
          })
        }
      }

      const searchOpenLibraryWithEditions = async () => {
        try {
          const { moreResultsExist: _moreResultsExist, resultsForPage: results } =
            await OpenLibrary.search(searchString, {
              includeEditions: true,
              limit: RESULTS_LIMIT,
            })

          // existing books always come first, followed by the 2x openlibrary results
          allOpenLibraryResults = concatUniqueSearchResults(results, allOpenLibraryResults)

          allOpenLibraryResults = search.processResults(allOpenLibraryResults, searchString, {
            applyFuzzySearch: true,
          })

          let currentResults = concatUniqueSearchResults(
            existingBooksResults,
            allOpenLibraryResults,
          )

          currentResults = currentResults.slice(0, RESULTS_LIMIT)

          setSearchResults(currentResults)
          setMoreResultsExist(_moreResultsExist)
        } catch (error: any) {
          if (error.message?.match(/json/i) || error.message?.match(/timed out/i)) {
            setErrorMessage(
              "Our search partner OpenLibrary may be experiencing issues. Try again later for better results!",
            )
          }

          reportToSentry(error, {
            searchString,
            options: {
              includeEditions: true,
            },
          })
        }

        searchWithEditionsFinished = true
      }

      await Promise.all([searchOpenLibrary(), searchOpenLibraryWithEditions()])
    } catch (error: any) {
      reportToSentry(error, { searchString })
    }
  }

  const resetSearch = () => {
    setIsSearching(false)
    setSearchResults(undefined)
    setUserSearchResults(undefined)
    setSelectedBook(null)
    setSelectedUser(null)
  }

  const handleSelect = (item) => {
    if (searchMode === "users") {
      if (isNav) setSelectedUser(item)
      setUserSearchResults(undefined)
    } else {
      if (isNav) setSelectedBook(item)
      setSearchResults(undefined)
    }
    const { shouldReset } = onSelect(item, searchMode) || {}
    if (shouldReset) resetSearch()
  }

  useEffect(() => {
    setIsSearching(false)
    setSelectedBook(null)
    setSelectedUser(null)
  }, [pathname, searchParams])

  const isLoadingUsers =
    searchMode === "users" && ((isSearching && !userSearchResults) || !!selectedUser)

  const isLoadingBooks =
    searchMode === "books" && ((isSearching && !searchResults) || !!selectedBook)
  const isLoadingMoreBooksResults = searchMode === "books" && isSearching && searchResults

  let placeholder = placeholderText
  if (!placeholder) {
    if (isNav) {
      if (isSignedIn) {
        placeholder = "book title and author (or @ for user)"
      } else {
        placeholder = "search by title and author"
      }
    } else {
      placeholder = "add by title and author"
    }
  }

  let inputWidthClass = _inputWidthClass
  if (isMobileNav) {
    inputWidthClass = "w-full"
  }

  let resultsWidthClass = _resultsWidthClass
  if (isMobileNav) {
    resultsWidthClass = "w-full"
  }

  return (
    <div className="relative">
      {disabled ? (
        <div>{disabledMessage}</div>
      ) : (
        <Combobox value={undefined} onChange={handleSelect}>
          {({ open }) => (
            <>
              {isNav && <BsSearch className="absolute top-[14px] left-4 text-gray-200" />}
              <Combobox.Input
                onChange={debouncedSearchHandler}
                displayValue={() => {
                  const name = selectedUser?.displayName || selectedUser?.username
                  const formattedName = name ? `@${name}` : undefined

                  return (searchMode === "books" ? selectedBook?.title : formattedName) || ""
                }}
                placeholder={placeholder}
                className={`${inputWidthClass} ${
                  isNav ? "px-11" : "px-4"
                } pt-2.5 pb-2 bg-gray-900 focus:outline-gold-500 rounded border-none font-mulish`}
              />
              {(open || selectedBook || selectedUser) && (
                <Combobox.Options
                  static
                  className={`${resultsWidthClass} absolute z-50 top-[50px] rounded bg-gray-900 font-mulish`}
                >
                  {searchMode === "users" ? (
                    <UserSearchResults
                      isLoading={isLoadingUsers}
                      searchResults={userSearchResults}
                      maxHeightClass={maxHeightClass}
                    />
                  ) : (
                    <BookSearchResults
                      isLoading={isLoadingBooks}
                      searchResults={searchResults}
                      isLoadingMoreResults={isLoadingMoreBooksResults}
                      moreResultsExist={moreResultsExist}
                      errorMessage={errorMessage}
                      maxHeightClass={maxHeightClass}
                    />
                  )}
                </Combobox.Options>
              )}
            </>
          )}
        </Combobox>
      )}
    </div>
  )
}

function UserSearchResults({ isLoading, searchResults, maxHeightClass }) {
  return (
    <>
      {isLoading && (
        <div className="h-20 flex items-center justify-center">
          {/* spinner is teal-300  */}
          <ThreeDotsScale width={32} height={32} color="hsl(181, 43%, 60%)" />
        </div>
      )}
      {!isLoading && searchResults && searchResults.length === 0 && (
        <div className="px-6 py-3">No users found.</div>
      )}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className={`${maxHeightClass} overflow-y-auto`}>
          {searchResults.map((userProfile) => (
            <Combobox.Option key={userProfile.id} value={userProfile} as={Fragment}>
              {({ active }) => (
                <li
                  className={`flex items-center ${
                    active && "bg-gray-700"
                  } px-4 py-1 cursor-pointer border-b border-b-gray-700 last:border-none`}
                >
                  <NameWithAvatar userProfile={userProfile} large bothNames />
                </li>
              )}
            </Combobox.Option>
          ))}
        </div>
      )}
    </>
  )
}

function BookSearchResults({
  isLoading,
  searchResults,
  isLoadingMoreResults,
  moreResultsExist,
  errorMessage,
  maxHeightClass,
}) {
  return (
    <>
      {isLoading && (
        <div className="h-24 flex items-center justify-center">
          {/* spinner is gold-300  */}
          <ThreeDotsScale width={32} height={32} color="hsl(45, 100%, 69%)" />
        </div>
      )}
      {!isLoading && searchResults && searchResults.length === 0 && (
        <div className="px-6 py-3">No books found.</div>
      )}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className={`${maxHeightClass} overflow-y-auto`}>
          {searchResults.map((book) => (
            <Combobox.Option key={book.openLibraryWorkId} value={book} as={Fragment}>
              {({ active }) => (
                <li
                  className={`flex items-center ${
                    active && "bg-gray-700"
                  } px-2 py-3 cursor-pointer border-b border-b-gray-700 last:border-none`}
                >
                  {book.coverImageThumbnailUrl || book.coverImageUrl ? (
                    <img
                      src={book.coverImageThumbnailUrl || book.coverImageUrl}
                      className="w-16 h-auto shrink-0 rounded-sm"
                      alt={`${book.title} cover`}
                    />
                  ) : (
                    <div className="w-16 h-24 shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
                      <GiOpenBook className="mt-0 text-4xl text-gray-500" />
                    </div>
                  )}
                  <div className="mx-4 grow">
                    <div className="mt-[-8px] font-bold">{truncateString(book.title, 64)}</div>
                    <div>{truncateString(book.authorName, 32)}</div>
                    <div className="mt-1 text-sm text-gray-200">
                      {book.editionsCount &&
                        `${book.editionsCount} ${
                          book.editionsCount === 1 ? "edition" : "editions"
                        } • `}
                      {book.firstPublishedYear}
                    </div>
                  </div>
                </li>
              )}
            </Combobox.Option>
          ))}
          {isLoadingMoreResults && (
            <li className="h-24 flex items-center justify-center">
              {/* spinner is gold-300  */}
              <ThreeDotsScale width={32} height={32} color="hsl(45, 100%, 69%)" />
            </li>
          )}
          {moreResultsExist && (
            <li className="px-6 py-6 text-gray-200">
              More results exist. Try searching by title and author to narrow them down!
            </li>
          )}
          {errorMessage && <li className="px-6 py-6 text-gray-200">{errorMessage}</li>}
        </div>
      )}
    </>
  )
}
