"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { getUserProfileLink, getUserListsLink, getUserBookNotesLink } from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function UserProfileTabs({ userProfile }) {
  const selectedLayoutSegment = useSelectedLayoutSegment()

  const { username } = userProfile
  const tabs = [
    {
      name: "profile",
      layoutPath: null,
      href: getUserProfileLink(username),
    },
    {
      name: "lists",
      layoutPath: "lists",
      href: getUserListsLink(username),
    },
    {
      name: "notes",
      layoutPath: "notes",
      href: getUserBookNotesLink(username),
    },
    {
      name: "followers",
      layoutPath: "followers",
      href: "#",
    },
    {
      name: "following",
      layoutPath: "following",
      href: "#",
    },
  ]

  function isCurrentTab(tab) {
    return tab.layoutPath === selectedLayoutSegment
  }

  return (
    <div className="font-mulish">
      <div className="sm:hidden">
        <div className="border border-gray-700 px-8 rounded-sm">
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
        <div className="border border-gray-700 px-8 rounded-sm">
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
    <a
      key={tab.name}
      href={tab.href}
      className={classNames(
        isCurrentTab ? "border-gold-500" : "border-transparent text-gray-500 hover:border-gray-300",
        "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium",
      )}
      aria-current={isCurrentTab ? "page" : undefined}
    >
      {tab.name}
    </a>
  )
}
