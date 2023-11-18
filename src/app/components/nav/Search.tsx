"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Combobox } from "@headlessui/react"
import { BsSearch } from "react-icons/bs"
import { GiOpenBook } from "react-icons/gi"
import { ThreeDotsScale } from "react-svg-spinners"
import debounce from "lodash.debounce"
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
  const [moreResultsExist, setMoreResultsExist] = useState<boolean>()
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>()

  const debouncedSearchHandler = useMemo(() => {
    async function onSearchChange(e: any) {
      const searchString = e.target.value

      if (searchString.length === 0) {
        setSearchResults(undefined)
        return
      }

      if (searchString.length < 3) return

      setIsSearching(true)

      const { moreResultsExist: _moreResultsExist, resultsForPage: results } =
        await OpenLibrary.search(searchString, RESULTS_LIMIT)

      setIsSearching(false)
      setSearchResults(results)
      setMoreResultsExist(_moreResultsExist)
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
                placeholder={`${isNav ? "Search" : "Add"} by title and author`}
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
