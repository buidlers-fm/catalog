"use client"

import Link from "next/link"
import { useUser } from "lib/contexts/UserContext"
import { BsXLg } from "react-icons/bs"
import { LuPartyPopper } from "react-icons/lu"
import { GiPartyPopper } from "react-icons/gi"

export default function YearInBooksGlobalBanner() {
  const { currentUser } = useUser()

  if (!currentUser) return null

  return (
    <div className="flex mx-4 xs:mx-8 border border-gold-500 p-5 font-newsreader text-lg rounded mb-4">
      <GiPartyPopper className="w-12 h-12 text-gold-300 mr-3 shrink-0" />
      <div className="mt-[1px]">
        <strong className="text-xl">Your catalog year in review is here! </strong> <br />
        See{" "}
        <Link className="cat-underline" href={`/users/${currentUser?.username}/2024`}>
          your 2024 in books
        </Link>{" "}
        for all the stats on your reading and your activity on catalog over the past year.
      </div>
      <button className="ml-auto pl-4 h-fit">
        <BsXLg />
      </button>
    </div>
  )
}
