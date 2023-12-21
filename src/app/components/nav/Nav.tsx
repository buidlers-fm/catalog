"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import humps from "humps"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXLg, BsEnvelopePaperHeartFill } from "react-icons/bs"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"
import type Book from "types/Book"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function Nav({ currentUserProfile }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigateToBookPage = (book: Book) => {
    const queryParams = {
      openLibraryWorkId: book.openLibraryWorkId,
      openLibraryEditionId: book.openLibraryBestEditionId,
    }

    const queryStr = new URLSearchParams(humps.decamelizeKeys(queryParams))
    const path = `/books?${queryStr}`

    const sameAsCurrentPath = pathname === path || searchParams.toString() === queryStr.toString()

    if (!sameAsCurrentPath) router.push(path)

    return { shouldReset: sameAsCurrentPath }
  }

  return (
    <>
      <div className="inline-block lg:hidden">
        <MobileNav currentUserProfile={currentUserProfile} onSelectBook={navigateToBookPage} />
      </div>
      <div className="hidden lg:inline-block">
        <DesktopNav currentUserProfile={currentUserProfile} onSelectBook={navigateToBookPage} />
      </div>
    </>
  )
}

function MobileNav({ currentUserProfile, onSelectBook }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname, searchParams])

  function handleSelectBook(book: Book) {
    const onSelectBookResults = onSelectBook(book)
    const { shouldReset } = onSelectBookResults

    if (shouldReset) setShowMobileSearch(false)

    return onSelectBookResults
  }

  return (
    <div className="flex">
      <button className="mt-1 px-2" onClick={() => setShowMobileSearch(true)}>
        <BsSearch className="text-[24px] text-gray-200" />
      </button>
      <button className="mt-1 ml-3 mr-2">
        <Link href="/guide" target="_blank" className="">
          <BsEnvelopePaperHeartFill className="text-[24px] text-gray-200" />
        </Link>
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
              <Search isMobileNav onSelect={handleSelectBook} />
            </div>
            <button className="ml-8" onClick={() => setShowMobileSearch(false)}>
              <BsXLg className="text-xl text-gray-200" />
            </button>
          </div>

          <div className="ml-2 text-gray-200">search by title and author.</div>
        </div>
      </Drawer>
    </div>
  )
}

function DesktopNav({ currentUserProfile, onSelectBook }) {
  return (
    <div className="flex">
      <div className="mr-10">
        <Search onSelect={onSelectBook} />
      </div>

      <div className="flex">
        <button className="-mt-2 mr-2">
          <Link href="/guide" target="_blank">
            <BsEnvelopePaperHeartFill className="text-[22px] text-gray-200" />
          </Link>
        </button>
        <div className="mr-4 mt-2">
          <UserNav currentUserProfile={currentUserProfile} />
        </div>
      </div>
    </div>
  )
}
