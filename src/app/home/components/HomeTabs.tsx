"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function HomeTabs() {
  const pathname = usePathname()

  const tabs = [
    {
      name: "statuses",
      href: "/home",
    },
    {
      name: "2023",
      href: "/home/lists/favorites-2023",
    },
    {
      name: "recent lists",
      href: "/home/lists/recent",
    },
    {
      name: "recent notes",
      href: "/home/notes/recent",
    },
    {
      name: "recent links",
      href: "/home/links/recent",
    },
  ]

  function isCurrentTab(tab) {
    return tab.href === pathname
  }

  return (
    <div className="font-mulish">
      <div className="sm:hidden max-w-xs mx-auto border border-gray-700 px-8 rounded-sm">
        <nav className="-mb-px" aria-label="Tabs">
          <div className="flex space-x-8 justify-center">
            {tabs.slice(0, 3).map((tab) => (
              <TabLink key={tab.name} tab={tab} isCurrentTab={isCurrentTab(tab)} />
            ))}
          </div>
          <div className="flex space-x-8 justify-center">
            {tabs.slice(3).map((tab) => (
              <TabLink key={tab.name} tab={tab} isCurrentTab={isCurrentTab(tab)} />
            ))}
          </div>
        </nav>
      </div>
      <div className="hidden sm:block border border-gray-700 px-8 rounded-sm">
        <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <TabLink key={tab.name} tab={tab} isCurrentTab={isCurrentTab(tab)} />
          ))}
        </nav>
      </div>
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
