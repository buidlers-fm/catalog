"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { BsXLg } from "react-icons/bs"
import { GiPartyPopper } from "react-icons/gi"
import { useUser } from "lib/contexts/UserContext"
import { getLocalStorage, setLocalStorage } from "lib/localstorage"

const YEAR_IN_BOOKS_2024_LOCALSTORAGE_KEY = "catalog__year-in-books-2024-seen"

export default function YearInBooksGlobalBanner() {
  const { currentUser } = useUser()
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const isBannerSeen = getLocalStorage(YEAR_IN_BOOKS_2024_LOCALSTORAGE_KEY)
    if (!isBannerSeen) {
      setShowBanner(true)
    }
  }, [])

  useEffect(() => {
    if (currentUser && pathname === `/users/${currentUser.username}/year/2024`) {
      setShowBanner(false)
      setLocalStorage(YEAR_IN_BOOKS_2024_LOCALSTORAGE_KEY, true)
    }
  }, [pathname, currentUser])

  if (!currentUser || !showBanner) return null

  const onCloseBanner = () => {
    setShowBanner(false)
    setLocalStorage(YEAR_IN_BOOKS_2024_LOCALSTORAGE_KEY, true)
  }

  return (
    <div className="flex mx-4 xs:mx-8 border border-gold-500 p-5 font-newsreader text-lg rounded mb-4">
      <GiPartyPopper className="w-12 h-12 text-gold-300 mr-3 shrink-0" />
      <div className="mt-[1px]">
        <strong className="text-xl">Your catalog year in review is here! </strong> <br />
        See{" "}
        <Link className="cat-underline" href={`/users/${currentUser.username}/year/2024`}>
          your 2024 in books
        </Link>{" "}
        for all the stats on your reading and your activity on catalog over the past year.
      </div>
      <button className="ml-auto pl-4 h-fit" onClick={onCloseBanner}>
        <BsXLg />
      </button>
    </div>
  )
}
