"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Combobox } from "@headlessui/react"
import { BsSearch } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
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

const RESULTS_LIMIT = 3
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
  const [searchResults, setSearchResults] = useState<Partial<Book>[]>()
  const [userSearchResults, setUserSearchResults] = useState<any[]>()
  const [personSearchResults, setPersonSearchResults] = useState<any[]>()
  const [moreResultsExist, setMoreResultsExist] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>()
  const [selectedUser, setSelectedUser] = useState<any | null>()
  const [selectedPerson, setSelectedPerson] = useState<any | null>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const debouncedSearchHandler = useMemo(() => {
    async function onSearchChange(e: any) {
      setErrorMessage(undefined)

      const searchString = e.target.value
      setMoreResultsExist(false)

      if (searchString.length === 0) {
        setSearchResults(undefined)
        setPersonSearchResults(undefined)
        setUserSearchResults(undefined)
        return
      }

      if (isNav) {
        if (isSignedIn) {
          await Promise.all([
            searchBooks(searchString),
            searchPeople(searchString),
            searchUsers(searchString),
          ])
        } else {
          await Promise.all([searchBooks(searchString), searchPeople(searchString)])
        }
      } else {
        await searchBooks(searchString)
      }

      setIsSearching(false)
    }

    return debounce(onSearchChange, DEBOUNCE_THRESHOLD_MS)
  }, [isNav, isSignedIn])

  const searchUsers = async (searchString: string) => {
    setIsSearching(true)

    try {
      let results = await api.profiles.search(searchString)
      results = results.slice(0, RESULTS_LIMIT)
      setUserSearchResults(results)
    } catch (error: any) {
      reportToSentry(error, { searchString })
    }
  }

  const searchBooks = async (_searchString: string) => {
    if (_searchString.length < 3) return

    const searchString = prepStringForSearch(_searchString)

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

  const searchPeople = async (searchString: string) => {
    try {
      let results = await api.people.search(searchString)
      results = results.slice(0, RESULTS_LIMIT)
      setPersonSearchResults(results)
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
    setSelectedPerson(null)
  }

  const handleSelect = (item) => {
    let itemType

    if (item.username) {
      if (isNav) {
        itemType = "user"
        setSelectedUser(item)
      }
      setUserSearchResults(undefined)
    } else if (item.authorName) {
      if (isNav) {
        itemType = "book"
        setSelectedBook(item)
      }
      setSearchResults(undefined)
    } else {
      if (isNav) {
        itemType = "person"
        setSelectedPerson(item)
      }
      setPersonSearchResults(undefined)
    }

    const { shouldReset } = onSelect(item, itemType) || {}
    if (shouldReset) resetSearch()
  }

  useEffect(() => {
    setIsSearching(false)
    setSelectedBook(null)
    setSelectedUser(null)
    setSelectedPerson(null)
  }, [pathname, searchParams])

  const isLoadingUsers = (isSearching && !userSearchResults) || !!selectedUser

  const isLoadingBooks = (isSearching && !searchResults) || !!selectedBook
  const isLoadingMoreBooksResults = isSearching && searchResults

  const isLoadingPeople = (isSearching && !personSearchResults) || !!selectedPerson

  let placeholder = placeholderText
  if (!placeholder) {
    if (isNav) {
      if (isSignedIn) {
        placeholder = "search"
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

                  return selectedBook?.title || selectedPerson?.name || formattedName || ""
                }}
                placeholder={placeholder}
                className={`${inputWidthClass} ${
                  isNav ? "px-11" : "px-4"
                } pt-2.5 pb-2 bg-gray-900 focus:outline-gold-500 rounded border-none font-mulish`}
              />
              {(open || selectedBook || selectedUser || selectedPerson) && (
                <Combobox.Options
                  static
                  className={`${resultsWidthClass} absolute z-50 top-[50px] rounded bg-gray-900 font-mulish`}
                >
                  <div className={`${maxHeightClass} overflow-y-auto`}>
                    <BookSearchResults
                      isLoading={isLoadingBooks}
                      searchResults={searchResults}
                      isLoadingMoreResults={isLoadingMoreBooksResults}
                      moreResultsExist={moreResultsExist}
                      errorMessage={errorMessage}
                    />
                    <PersonSearchResults
                      isLoading={isLoadingPeople}
                      searchResults={personSearchResults}
                    />
                    <UserSearchResults
                      isLoading={isLoadingUsers}
                      searchResults={userSearchResults}
                    />
                  </div>
                </Combobox.Options>
              )}
            </>
          )}
        </Combobox>
      )}
    </div>
  )
}

function UserSearchResults({ isLoading, searchResults }) {
  return (
    <>
      <div className="p-2 font-bold">Users</div>
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
        <div>
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

function PersonSearchResults({ isLoading, searchResults }) {
  return (
    <>
      <div className="p-2 font-bold">People</div>
      {isLoading && (
        <div className="h-20 flex items-center justify-center">
          {/* spinner is teal-300  */}
          <ThreeDotsScale width={32} height={32} color="hsl(181, 43%, 60%)" />
        </div>
      )}
      {!isLoading && searchResults && searchResults.length === 0 && (
        <div className="px-6 py-3">No people found.</div>
      )}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div>
          {searchResults.map((person) => (
            <Combobox.Option key={person.id} value={person} as={Fragment}>
              {({ active }) => (
                <li
                  className={`flex items-center ${
                    active && "bg-gray-700"
                  } px-4 py-1 cursor-pointer border-b border-b-gray-700 last:border-none`}
                >
                  <PersonResult person={person} />
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
}) {
  return (
    <>
      <div className="p-2 font-bold">Books</div>
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
        <div>
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
              More book results exist. Try searching by title and author to narrow them down!
            </li>
          )}
          {errorMessage && <li className="px-6 py-6 text-gray-200">{errorMessage}</li>}
        </div>
      )}
    </>
  )
}

function PersonResult({ person }) {
  const { name, imageUrl, title, orgName } = person

  return (
    <div className="my-2 flex">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="mr-2 w-[48px] h-[48px] rounded-full" />
      ) : (
        <FaUserCircle className="shrink-0 mr-2 text-5xl text-gold-100" />
      )}
      <div className="ml-3 flex flex-col justify-center">
        <div>{name}</div>
        {title && <div className="text-gray-300 text-sm">{title}</div>}
        {orgName && <div className="text-gray-300 text-sm">{orgName}</div>}
      </div>
    </div>
  )
}
