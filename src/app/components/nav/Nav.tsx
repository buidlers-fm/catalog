"use client"

import dynamic from "next/dynamic"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import humps from "humps"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXLg } from "react-icons/bs"
import { FaPlus } from "react-icons/fa"
import { useUser } from "lib/contexts/UserContext"
import { useModals } from "lib/contexts/ModalsContext"
import { getUserProfileLink, getPersonLinkAgnostic } from "lib/helpers/general"
import { reportToSentry } from "lib/sentry"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"
import Announcements from "app/components/nav/Announcements"
import CurrentModal from "enums/CurrentModal"
import type Book from "types/Book"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { isFetching: isLoading, currentUserProfile } = useUser()
  const { setCurrentModal } = useModals()

  const navigate = (item, type) => {
    if (type === "book") return navigateToBookPage(item)
    if (type === "user") return navigateToUserProfilePage(item)
    if (type === "person") return navigateToPersonPage(item)

    reportToSentry(new Error(`Unknown type ${type}`), { item, type })
  }

  const navigateToUserProfilePage = (userProfile) => {
    const path = getUserProfileLink(userProfile.username)

    const sameAsCurrentPath = pathname === path

    if (!sameAsCurrentPath) router.push(path)

    return { shouldReset: sameAsCurrentPath }
  }

  const navigateToPersonPage = (person) => {
    const path = getPersonLinkAgnostic(person)

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
        <MobileNav
          currentUserProfile={currentUserProfile}
          isLoading={isLoading}
          onSelectItem={navigate}
          setCurrentModal={setCurrentModal}
        />
      </div>
      <div className="hidden lg:inline-block">
        <DesktopNav
          currentUserProfile={currentUserProfile}
          isLoading={isLoading}
          onSelectItem={navigate}
          setCurrentModal={setCurrentModal}
        />
      </div>
    </>
  )
}

function MobileNav({ currentUserProfile, isLoading, onSelectItem, setCurrentModal }) {
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
    <div className="flex items-center">
      <button
        className={currentUserProfile ? "mt-1 mr-1 px-2" : "mt-2 mr-3 px-2"}
        onClick={() => setShowMobileSearch(true)}
      >
        <BsSearch className="text-[24px] text-gray-200" />
      </button>

      {currentUserProfile && <Announcements currentUserProfile={currentUserProfile} isMobile />}

      {currentUserProfile && (
        <div className="mx-2">
          <CreateButton setCurrentModal={setCurrentModal} />
        </div>
      )}

      {isLoading ? (
        <div
          className={`${
            currentUserProfile ? "ml-3 mt-0.5" : "mt-1.5"
          } h-6 w-6 bg-gray-500 rounded-full animate-pulse`}
        />
      ) : (
        <div className="-mt-0.5">
          <UserNav currentUserProfile={currentUserProfile} />
        </div>
      )}
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

          <div className="ml-2 text-gray-200">search books, people, or users.</div>
        </div>
      </Drawer>
    </div>
  )
}

function DesktopNav({ currentUserProfile, isLoading, onSelectItem, setCurrentModal }) {
  return (
    <div className="flex">
      <div className="mr-8">
        <Search onSelect={onSelectItem} isSignedIn={!!currentUserProfile} />
      </div>

      <div className="flex items-center">
        {currentUserProfile && (
          <Announcements currentUserProfile={currentUserProfile} isMobile={false} />
        )}

        {currentUserProfile && (
          <div className="mr-2.5 my-2">
            <CreateButton setCurrentModal={setCurrentModal} />
          </div>
        )}

        <div className="mr-4 mt-2">
          {isLoading ? (
            <div className="h-6 w-6 bg-gray-500 rounded-full animate-pulse" />
          ) : (
            <UserNav currentUserProfile={currentUserProfile} />
          )}
        </div>
      </div>
    </div>
  )
}

function CreateButton({ setCurrentModal }) {
  return (
    <button
      onClick={() => setCurrentModal(CurrentModal.GlobalCreate)}
      className="cat-btn p-2 cat-btn-gold"
    >
      <FaPlus className="text-xs text-black" />
    </button>
  )
}
