"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXLg } from "react-icons/bs"
import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function MobileNav() {
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname])

  return (
    <div className="flex">
      <button className="mt-2 px-2" onClick={() => setShowMobileSearch(true)}>
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
            <Search isMobileNav />
          </div>
          <button className="ml-8" onClick={() => setShowMobileSearch(false)}>
            <BsXLg className="text-xl text-gray-200" />
          </button>
        </div>
      </Drawer>
    </div>
  )
}
