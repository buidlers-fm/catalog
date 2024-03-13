"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Tooltip } from "react-tooltip"
import { getSelectorsByUserAgent } from "react-device-detect"
import { getBookLink } from "lib/helpers/general"
import { truncateString } from "lib/helpers/strings"

export default function BookTooltip({ book, anchorSelect: _anchorSelect }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = navigator?.userAgent || ""
    const { isMobile: _isMobile } = getSelectorsByUserAgent(userAgent)
    setIsMobile(_isMobile)
  }, [])

  const anchorSelect = _anchorSelect || `#book-${book.id}`

  return (
    <Tooltip
      anchorSelect={anchorSelect}
      className="z-10 max-w-[240px] font-mulish"
      clickable={isMobile}
    >
      <Link href={getBookLink(book.slug)}>
        <button disabled={!isMobile}>
          <div className="text-center">{truncateString(`${book.title}`, 40)}</div>
          <div className="text-center">{truncateString(`by ${book.authorName}`, 40)}</div>
          {isMobile && <div className="underline">Go to page</div>}
        </button>
      </Link>
    </Tooltip>
  )
}
