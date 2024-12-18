"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import {
  getUserProfileLink,
  getUserListsLink,
  getUserShelvesLink,
  getUserBookNotesLink,
  getUserFollowersLink,
  getUserEditsLink,
} from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function UserProfileTabs({ userProfile, shelves }) {
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
    // shelves tab dependent on prop
    ...(shelves
      ? [
          {
            name: "shelves",
            layoutPath: "shelves",
            href: getUserShelvesLink(username),
          },
        ]
      : []),
    {
      name: "notes",
      layoutPath: "notes",
      href: getUserBookNotesLink(username),
    },
    {
      name: "friends",
      layoutPath: "(friends)",
      href: getUserFollowersLink(username),
    },
    {
      name: "edits",
      layoutPath: "edits",
      href: getUserEditsLink(username),
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
