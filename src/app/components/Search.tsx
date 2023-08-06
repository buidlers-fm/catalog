"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Combobox } from "@headlessui/react"
import { BsSearch } from "react-icons/bs"
import { GiOpenBook } from "react-icons/gi"
import { BarsFade } from "react-svg-spinners"
import debounce from "lodash.debounce"
import OpenLibrary from "lib/openlibrary"
import { truncateString } from "lib/helpers/general"
import type Book from "types/Book"

const RESULTS_LIMIT = 3

export default function Search() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchResults, setSearchResults] = useState<Partial<Book>[]>()
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

      console.log("searching...")

      setIsSearching(true)

      const results = await OpenLibrary.search(searchString, RESULTS_LIMIT)

      console.log(results)
      setIsSearching(false)
      setSearchResults(results)
    }

    return debounce(onSearchChange, 300)
  }, [])

  const handleSelect = (book: Book) => {
    if (isSearching) return
    setSelectedBook(book)
    setSearchResults(undefined)
    router.push(`/books/${book.openlibraryId}`)
  }

  useEffect(() => {
    setSelectedBook(null)
  }, [pathname])

  const isLoading = (isSearching && !searchResults) || !!selectedBook

  return (
    <div className="relative">
      <Combobox value={undefined} onChange={handleSelect}>
        {({ open }) => (
          <>
            <BsSearch className="absolute top-[15px] left-4 text-gray-200" />
            <Combobox.Input
              onChange={debouncedSearchHandler}
              displayValue={() => selectedBook?.title || ""}
              className="w-96 px-11 pt-3 pb-2 bg-gray-900 rounded border-none font-nunito-sans"
            />
            {(open || selectedBook) && (
              <Combobox.Options
                static
                className="absolute top-[50px] w-96 rounded bg-gray-900 font-nunito-sans"
              >
                {isLoading && (
                  <div className="h-24 flex items-center justify-center">
                    {/* spinner is teal-500  */}
                    <BarsFade width={32} height={32} color="hsl(181, 64%, 40%)" />
                  </div>
                )}
                {!isLoading && searchResults && searchResults.length === 0 && (
                  <div className="px-6 py-3">No books found.</div>
                )}
                {!isLoading && searchResults && searchResults.length > 0 && (
                  <>
                    {searchResults.map((book) => (
                      <Combobox.Option key={book.openlibraryId} value={book} as={Fragment}>
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
                              <div className="mt-[-8px] mb-1 font-bold">
                                {truncateString(book.title, 64)}
                              </div>
                              <div>{truncateString(book.by, 32)}</div>
                            </div>
                            <div className={`w-1 h-24 shrink-0 ${active && "bg-gold-500"}`} />
                          </li>
                        )}
                      </Combobox.Option>
                    ))}
                  </>
                )}
              </Combobox.Options>
            )}
          </>
        )}
      </Combobox>
    </div>
  )
}
