"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import humps from "humps"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXLg } from "react-icons/bs"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function MobileNav({ currentUserProfile }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname])

  const navigateToBookPage = (book) => {
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
      <button className="mt-1 px-2" onClick={() => setShowMobileSearch(true)}>
        <BsSearch className="text-[24px] text-gray-200" />
      </button>
      <UserNav currentUserProfile={currentUserProfile} />
      <Drawer
        open={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        direction="top"
        style={{ backgroundColor: "hsl(26, 4%, 12%)", height: "100vh" }}
      >
        <div className="p-8">
          <div className="flex mb-4">
            <div className="grow">
              <Search isMobileNav onSelect={navigateToBookPage} />
            </div>
            <button className="ml-8" onClick={() => setShowMobileSearch(false)}>
              <BsXLg className="text-xl text-gray-200" />
            </button>
          </div>

          <div className="ml-2 text-gray-200">Search by title and author.</div>
        </div>
      </Drawer>
    </div>
  )
}
