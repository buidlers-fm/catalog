"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXLg } from "react-icons/bs"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname])

  const navigateToBookPage = (book) =>
    router.push(`/books?openlibraryWorkId=${book.openlibraryWorkId}`)

  return (
    <div className="flex">
      <button className="mt-1 px-2" onClick={() => setShowMobileSearch(true)}>
        <BsSearch className="text-[24px] text-gray-200" />
      </button>
      <UserNav />
      <Drawer
        open={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        direction="top"
        style={{ backgroundColor: "hsl(26, 4%, 12%)", height: "75vh" }}
      >
        <div className="p-8 flex">
          <div className="grow">
            <Search isMobileNav onSelect={navigateToBookPage} />
          </div>
          <button className="ml-8" onClick={() => setShowMobileSearch(false)}>
            <BsXLg className="text-xl text-gray-200" />
          </button>
        </div>
      </Drawer>
    </div>
  )
}
