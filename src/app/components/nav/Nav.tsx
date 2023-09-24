"use client"

import { useRouter } from "next/navigation"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"

export default function Nav() {
  const router = useRouter()

  const navigateToBookPage = (book) => router.push(`/books/${book.openlibraryBookId}`)

  return (
    <div className="flex">
      <Search onSelect={navigateToBookPage} />
      <div className="ml-12 mr-4 mt-2">
        <UserNav />
      </div>
    </div>
  )
}
