"use client"

import Link from "next/link"
import { useRouter, useSelectedLayoutSegment } from "next/navigation"
import { getUserShelvesLink } from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function UserShelvesTabs({ userProfile }) {
  const selectedLayoutSegment = useSelectedLayoutSegment()
  const router = useRouter()

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

  function getCurrentTab() {
    return tabs.find((tab) => isCurrentTab(tab)) || tabs[0]
  }

  function handleTabChange(e) {
    const tab = tabs.find((t) => t.layoutPath === e.target.value)
    router.push(tab!.href)
  }

  return (
    <div className="font-mulish">
      <div className="sm:hidden w-full">
        <label htmlFor="userShelvesTabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="userShelvesTabs"
          name="userShelvesTabs"
          className="block w-full bg-gray-800 text-white rounded-md border-gray-300 py-2 pl-3 pr-10 focus:border-gold-500 focus:outline-none focus:ring-gold-500"
          defaultValue={getCurrentTab()!.layoutPath}
          onChange={handleTabChange}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.layoutPath}>
              {tab.name}
            </option>
          ))}
        </select>
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
