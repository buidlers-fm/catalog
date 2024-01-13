"use client"

import dynamic from "next/dynamic"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import humps from "humps"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXLg } from "react-icons/bs"
import { getUserProfileLink } from "lib/helpers/general"
import { reportToSentry } from "lib/sentry"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"
import Announcements from "app/components/nav/Announcements"
import type Book from "types/Book"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function Nav({ currentUserProfile }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigate = (item, type) => {
    if (type === "books") return navigateToBookPage(item)
    if (type === "users") return navigateToUserProfilePage(item)

    reportToSentry(new Error(`Unknown type ${type}`), { item, type })
  }

  const navigateToUserProfilePage = (userProfile) => {
    const path = getUserProfileLink(userProfile.username)

    const sameAsCurrentPath = pathname === path

    if (!sameAsCurrentPath) router.push(path)

    return { shouldReset: sameAsCurrentPath }
  }

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
        <MobileNav currentUserProfile={currentUserProfile} onSelectItem={navigate} />
      </div>
      <div className="hidden lg:inline-block">
        <DesktopNav currentUserProfile={currentUserProfile} onSelectItem={navigate} />
      </div>
    </>
  )
}

function MobileNav({ currentUserProfile, onSelectItem }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname, searchParams])

  function handleSelectItem(item, type) {
    const onSelectItemResults = onSelectItem(item, type)
    const { shouldReset } = onSelectItemResults

    if (shouldReset) setShowMobileSearch(false)

    return onSelectItemResults
  }

  return (
    <div className="flex">
      <button className="mt-1 px-2" onClick={() => setShowMobileSearch(true)}>
        <BsSearch className="text-[24px] text-gray-200" />
      </button>
      {currentUserProfile && <Announcements currentUserProfile={currentUserProfile} isMobile />}
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
              <Search isMobileNav onSelect={handleSelectItem} isSignedIn={!!currentUserProfile} />
            </div>
            <button className="ml-8" onClick={() => setShowMobileSearch(false)}>
              <BsXLg className="text-xl text-gray-200" />
            </button>
          </div>

          <div className="ml-2 text-gray-200">search by title and author, type @ for user.</div>
        </div>
      </Drawer>
    </div>
  )
}

function DesktopNav({ currentUserProfile, onSelectItem }) {
  return (
    <div className="flex">
      <div className="mr-10">
        <Search onSelect={onSelectItem} isSignedIn={!!currentUserProfile} />
      </div>

      <div className="flex">
        {currentUserProfile && (
          <Announcements currentUserProfile={currentUserProfile} isMobile={false} />
        )}
        <div className="mr-4 mt-2">
          <UserNav currentUserProfile={currentUserProfile} />
        </div>
      </div>
    </div>
  )
}
