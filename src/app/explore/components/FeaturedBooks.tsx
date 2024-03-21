"use client"

import { useState, useEffect } from "react"
import api from "lib/api"
import ListBook from "app/lists/components/ListBook"
import LoadingSection from "app/components/LoadingSection"

export default function FeaturedBooks() {
  const [list, setList] = useState<any>()

  useEffect(() => {
    async function fetchList() {
      const [_list] = await api.lists.get({ featured: true })
      setList(_list)
    }

    fetchList()
  }, [])

  let bookIdsToNotes: any = {}

  if (list) {
    bookIdsToNotes = list.listItemAssignments.reduce((obj, lta) => {
      obj[lta.listedObjectId] = lta.note
      return obj
    }, {})
  } else {
    return null
  }

  return (
    <div className="mt-4 xs:w-[440px] sm:w-[600px] xs:mx-auto">
      <div className="sm:flex sm:items-start">
        <div className="text-3xl font-semibold mb-1 sm:mr-6">featured new books</div>
      </div>

      <div className="">
        Hand-picked by catalog staff. Click on the sticky note on each book to see why we chose it!
      </div>

      {list ? (
        <div className="sm:my-4 p-0 grid grid-cols-3 xs:grid-cols-4 -mx-2 ml:gap-x-[28px]">
          {list.books!.map((book, index: number) => (
            <ListBook
              key={book!.id}
              book={book}
              note={bookIdsToNotes[book.id]}
              isRanked={false}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <LoadingSection />
        </div>
      )}
    </div>
  )
}
