"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import { BsSearch, BsXCircle, BsXLg } from "react-icons/bs"
import Search from "app/components/Search"

export default function MobileNav() {
  const pathname = usePathname()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname])

  return (
    <>
      <button className="mt-2 px-2" onClick={() => setShowMobileSearch(true)}>
        <BsSearch className="text-[24px] text-gray-200" />
      </button>
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
    </>
  )
}
