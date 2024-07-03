"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { getPersonEditLink, getPersonEditBooksLink } from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function EditPersonTabs({ person }) {
  const selectedLayoutSegment = useSelectedLayoutSegment()

  const tabs = [
    {
      name: "details",
      layoutPath: null,
      href: getPersonEditLink(person.slug),
    },
    {
      name: "books",
      layoutPath: "books",
      href: getPersonEditBooksLink(person.slug),
    },
  ]

  function isCurrentTab(tab) {
    return tab.layoutPath === selectedLayoutSegment
  }

  return (
    <div className="mx-auto w-fit border-b border-gray-700 px-8 rounded-sm font-mulish">
      <nav className="-mb-px flex gap-x-8 sm:gap-x-16" aria-label="Tabs">
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
