"use client"

import { useRouter } from "next/navigation"
import humps from "humps"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"
import type Book from "types/Book"

export default function Nav({ currentUserProfile }) {
  const router = useRouter()

  const navigateToBookPage = (book: Book) => {
    const queryParams = {
      openLibraryWorkId: book.openLibraryWorkId,
      openLibraryEditionId: book.openLibraryBestEditionId,
    }

    const queryStr = new URLSearchParams(humps.decamelizeKeys(queryParams))
    const path = `/books?${queryStr}`

    router.push(path)
  }

  return (
    <div className="flex">
      <Search onSelect={navigateToBookPage} />
      <div className="ml-12 mr-4 mt-2">
        <UserNav currentUserProfile={currentUserProfile} />
      </div>
    </div>
  )
}
