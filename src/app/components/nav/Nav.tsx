"use client"

import { useRouter } from "next/navigation"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"

export default function Nav({ currentUserProfile }) {
  const router = useRouter()

  const navigateToBookPage = (book) =>
    router.push(`/books?open_library_work_id=${book.openLibraryWorkId}`)

  return (
    <div className="flex">
      <Search onSelect={navigateToBookPage} />
      <div className="ml-12 mr-4 mt-2">
        <UserNav currentUserProfile={currentUserProfile} />
      </div>
    </div>
  )
}
