"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { getUserFollowersLink, getUserFollowingLink } from "lib/helpers/general"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function UserFriendsTabs({ userProfile }) {
  const selectedLayoutSegment = useSelectedLayoutSegment()

  const { username } = userProfile
  const tabs = [
    {
      name: "followers",
      layoutPath: "followers",
      href: getUserFollowersLink(username),
    },
    {
      name: "following",
      layoutPath: "following",
      href: getUserFollowingLink(username),
    },
  ]

  function isCurrentTab(tab) {
    return tab.layoutPath === selectedLayoutSegment
  }

  return (
    <div className="border-b border-gray-700 px-8 rounded-sm font-mulish">
      <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
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
