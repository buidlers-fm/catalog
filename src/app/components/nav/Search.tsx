"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Combobox } from "@headlessui/react"
import { BsSearch } from "react-icons/bs"
import { GiOpenBook } from "react-icons/gi"
import { ThreeDotsScale } from "react-svg-spinners"
import debounce from "lodash.debounce"
import api from "lib/api"
import OpenLibrary from "lib/openLibrary"
import { truncateString } from "lib/helpers/general"
import type Book from "types/Book"

const RESULTS_LIMIT = 8

type Props = {
  onSelect: (selectedBook) => void
  isNav?: boolean
  isMobileNav?: boolean
  disabled?: boolean
  disabledMessage?: string
}

const concatUniqueSearchResults = (resultsA, resultsB) => {
  // resultsA has priority
  const uniqueResultsB = resultsB.filter(
    (bookB) => !resultsA.find((bookA) => bookA.openLibraryWorkId === bookB.openLibraryWorkId),
  )

  return [...resultsA, ...uniqueResultsB]
}

const mergeSearchResults = (resultsA, resultsB) => {
  // preserve order of resultsA, but override with values from resultsB
  const resultMap = new Map(resultsB.map((result) => [result.openLibraryWorkId, result]))

  return resultsA.map((result) => resultMap.get(result.openLibraryWorkId) || result)
}

export default function Search({
  onSelect,
  isNav = true,
  isMobileNav = false,
  disabled = false,
  disabledMessage,
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<Partial<Book>[]>()
  const [moreResultsExist, setMoreResultsExist] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>()

  const debouncedSearchHandler = useMemo(() => {
    async function onSearchChange(e: any) {
      const searchString = e.target.value
      setMoreResultsExist(false)

      if (searchString.length === 0) {
        setSearchResults(undefined)
        return
      }

      if (searchString.length < 3) return

      setIsSearching(true)

      let existingBooksResults: any[] = []
      try {
        existingBooksResults = await api.books.search(searchString)
        if (existingBooksResults.length > 0) {
          setSearchResults(existingBooksResults)
        }
      } catch (error: any) {
        console.error(error)
      }

      let allOpenLibraryResults: any[] = []
      let searchWithEditionsFinished = false

      try {
        const searchOpenLibrary = async () => {
          const { moreResultsExist: _moreResultsExist, resultsForPage: results } =
            await OpenLibrary.search(searchString, { includeEditions: false, limit: RESULTS_LIMIT })

          // because this search's results are just placeholders until the
          // better, slower results come in
          if (searchWithEditionsFinished) return

          allOpenLibraryResults = results
          const currentResults = concatUniqueSearchResults(existingBooksResults, results)

          setSearchResults(currentResults)
          setMoreResultsExist(_moreResultsExist)
        }

        const searchOpenLibraryWithEditions = async () => {
          try {
            const { moreResultsExist: _moreResultsExist, resultsForPage: results } =
              await OpenLibrary.search(searchString, {
                includeEditions: true,
                limit: RESULTS_LIMIT,
              })

            // existing books always come first, followed by the 2x openlibrary results,
            // merged with each other such that we use the order of the first results,
            // but override with the values of the later results.
            // this prevents disorienting changes to the order of results; the arrival
            // of later results should only result in titles and/or covers changing, in place.
            allOpenLibraryResults = mergeSearchResults(allOpenLibraryResults, results)
            const currentResults = concatUniqueSearchResults(
              existingBooksResults,
              allOpenLibraryResults,
            )

            setSearchResults(currentResults)
            setMoreResultsExist(_moreResultsExist)
          } catch (error: any) {
            console.error(error)
          }

          searchWithEditionsFinished = true
        }

        await Promise.all([searchOpenLibrary(), searchOpenLibraryWithEditions()])
      } catch (error: any) {
        console.error(error)
      }

      setIsSearching(false)
    }

    return debounce(onSearchChange, 300)
  }, [])

  const handleSelect = (book: Book) => {
    if (isSearching) return
    if (isNav) setSelectedBook(book)
    setSearchResults(undefined)
    onSelect(book)
  }

  useEffect(() => {
    setIsSearching(false)
    setSelectedBook(null)
  }, [pathname, searchParams])

  const isLoading = (isSearching && !searchResults) || !!selectedBook
  const isLoadingMoreResults = isSearching && searchResults

  return (
    <div className="relative">
      {disabled ? (
        <div>{disabledMessage}</div>
      ) : (
        <Combobox value={undefined} onChange={handleSelect}>
          {({ open }) => (
            <>
              {isNav && <BsSearch className="absolute top-[15px] left-4 text-gray-200" />}
              <Combobox.Input
                onChange={debouncedSearchHandler}
                displayValue={() => selectedBook?.title || ""}
                placeholder={
                  isMobileNav ? undefined : `${isNav ? "Search" : "Add"} by title and author`
                }
                className={`${isMobileNav ? "w-full" : "w-full xs:w-96"} ${
                  isNav ? "px-11" : "px-4"
                } pt-3 pb-2 bg-gray-900 focus:outline-gold-500 rounded border-none font-mulish`}
              />
              {(open || selectedBook) && (
                <Combobox.Options
                  static
                  className={`${
                    isMobileNav ? "w-full" : "w-full xs:w-96"
                  } absolute z-50 top-[50px] rounded bg-gray-900 font-mulish`}
                >
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
                    <div className="max-h-[calc(100vh-192px)] overflow-y-auto">
                      {searchResults.map((book) => (
                        <Combobox.Option key={book.openLibraryWorkId} value={book} as={Fragment}>
                          {({ active }) => (
                            <li
                              className={`flex items-center ${
                                active && "bg-gray-700"
                              } px-2 py-3 cursor-pointer border-b border-b-gray-700 last:border-none`}
                            >
                              {book.coverImageUrl ? (
                                <img
                                  src={book.coverImageUrl}
                                  className="w-16 h-auto shrink-0 rounded-sm"
                                  alt={`${book.title} cover`}
                                />
                              ) : (
                                <div className="w-16 h-24 shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
                                  <GiOpenBook className="mt-0 text-4xl text-gray-500" />
                                </div>
                              )}
                              <div className="mx-4 grow">
                                <div className="mt-[-8px] font-bold">
                                  {truncateString(book.title, 64)}
                                </div>
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
                    </div>
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
