"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUnreads } from "lib/contexts/UnreadsContext"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function HomeTabs() {
  const pathname = usePathname()
  const { hasUnreadNotifs, hasUnreadRecs } = useUnreads()

  const tabs = [
    {
      name: "notifs",
      href: "/inbox/notifs",
    },
    {
      name: "recs",
      href: "/inbox/recs",
    },
  ]

  function isCurrentTab(tab) {
    return tab.href === pathname
  }

  return (
    <div className="font-mulish">
      <div className="sm:hidden w-fit max-w-xs mx-auto border-b border-b-gray-700 px-8 rounded-sm">
        <nav className="-mb-px" aria-label="Tabs">
          <div className="flex space-x-4 justify-center">
            {tabs.slice(0, 3).map((tab) => (
              <TabLink
                key={tab.name}
                tab={tab}
                isCurrentTab={isCurrentTab(tab)}
                hasUnreadNotifs={hasUnreadNotifs}
                hasUnreadRecs={hasUnreadRecs}
              />
            ))}
          </div>
        </nav>
      </div>
      <div className="hidden sm:block w-fit mx-auto border-b border-b-gray-700 px-8 rounded-sm">
        <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <TabLink
              key={tab.name}
              tab={tab}
              isCurrentTab={isCurrentTab(tab)}
              hasUnreadNotifs={hasUnreadNotifs}
              hasUnreadRecs={hasUnreadRecs}
            />
          ))}
        </nav>
      </div>
    </div>
  )
}

function TabLink({ tab, isCurrentTab, hasUnreadNotifs, hasUnreadRecs }) {
  const hasUnreads = tab.name === "notifs" ? hasUnreadNotifs : hasUnreadRecs

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
      <div className="relative">
        <span>{tab.name}</span>
        {hasUnreads && (
          <span className="w-1.5 h-1.5 absolute top-[7px] -right-2.5 rounded-full bg-gold-200" />
        )}
      </div>
    </Link>
  )
}
