"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { getUserShelvesLink } from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function UserShelvesTabs({ userProfile }) {
  const selectedLayoutSegment = useSelectedLayoutSegment()

  const { username } = userProfile
  const tabs = [
    {
      name: "to read",
      layoutPath: "to-read",
      href: `${getUserShelvesLink(username)}/to-read`,
    },
    {
      name: "up next",
      layoutPath: "up-next",
      href: `${getUserShelvesLink(username)}/up-next`,
    },
    {
      name: "currently reading",
      layoutPath: "currently-reading",
      href: `${getUserShelvesLink(username)}/currently-reading`,
    },
    {
      name: "read",
      layoutPath: "read",
      href: `${getUserShelvesLink(username)}/read`,
    },
    {
      name: "abandoned",
      layoutPath: "abandoned",
      href: `${getUserShelvesLink(username)}/abandoned`,
    },
  ]

  function isCurrentTab(tab) {
    return tab.layoutPath === selectedLayoutSegment
  }

  return (
    <div className="font-mulish">
      <div className="sm:hidden">
        <div className="border-b border-gray-700 px-8 rounded-sm">
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
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-700 px-8 rounded-sm">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <TabLink key={tab.name} tab={tab} isCurrentTab={isCurrentTab(tab)} />
            ))}
          </nav>
        </div>
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
        isCurrentTab ? "text-gold-500" : "text-gray-500",
        "whitespace-nowrap py-2 px-1 text-sm",
      )}
      aria-current={isCurrentTab ? "page" : undefined}
      scroll={false}
    >
      {tab.name}
    </Link>
  )
}
