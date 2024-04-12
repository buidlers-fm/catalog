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

  if (isMobile) return null

  return (
    <Tooltip anchorSelect={anchorSelect} className="z-10 max-w-[240px] font-mulish">
      <Link href={getBookLink(book.slug)}>
        <button>
          <div className="text-center">{truncateString(`${book.title}`, 40)}</div>
          <div className="text-center">{truncateString(`by ${book.authorName}`, 40)}</div>
        </button>
      </Link>
    </Tooltip>
  )
}
