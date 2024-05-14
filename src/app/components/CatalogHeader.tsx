"use client"

import Link from "next/link"
import { Suspense } from "react"
import { useUser } from "lib/contexts/UserContext"
import Nav from "app/components/nav/Nav"

export default function CatalogHeader() {
  const { currentUserProfile } = useUser()
  const isSignedIn = !!currentUserProfile

  return (
    <header className="px-4 xs:px-8 py-8 flex justify-between items-center">
      <div
        data-intro-tour="catalog-home"
        className="self-start text-3xl sm:text-4xl font-chivo-mono font-bold text-gold-500 tracking-wide"
      >
        <Link href={isSignedIn ? "/home" : "/"}>catalog</Link>
      </div>
      <div data-intro-tour="nav-bar">
        <Suspense>
          <Nav />
        </Suspense>
      </div>
    </header>
  )
}
