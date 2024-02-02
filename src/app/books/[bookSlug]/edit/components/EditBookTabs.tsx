"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { getBookEditLink, getBookEditCoversLink } from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function EditBookTabs({ book }) {
  const selectedLayoutSegment = useSelectedLayoutSegment()

  const tabs = [
    {
      name: "edit details",
      layoutPath: null,
      href: getBookEditLink(book.slug),
    },
    {
      name: "edit cover",
      layoutPath: "covers",
      href: getBookEditCoversLink(book.slug),
    },
  ]

  function isCurrentTab(tab) {
    return tab.layoutPath === selectedLayoutSegment
  }

  return (
    <div className="w-fit border-b border-gray-700 px-8 rounded-sm font-mulish">
      <nav className="-mb-px flex gap-x-16" aria-label="Tabs">
        {tabs.map((tab) => (
          <TabLink key={tab.name} tab={tab} isCurrentTab={isCurrentTab(tab)} />
        ))}
      </nav>
    </div>
  )
}

function TabLink({ tab, isCurrentTab }) {
  return (
    <Link
      key={tab.name}
      href={tab.href}
      className={classNames(
        isCurrentTab ? "border-gold-500" : "border-transparent text-gray-500 hover:border-gray-300",
        "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium",
      )}
      aria-current={isCurrentTab ? "page" : undefined}
      scroll={false}
    >
      {tab.name}
    </Link>
  )
}
