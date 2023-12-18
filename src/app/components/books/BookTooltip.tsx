import Link from "next/link"
import { Tooltip } from "react-tooltip"
import { isMobile } from "react-device-detect"
import { truncateString, getBookLink } from "lib/helpers/general"

export default function BookTooltip({ book, anchorSelect: _anchorSelect }) {
  const anchorSelect = _anchorSelect || `#book-${book.id}`

  return (
    <Tooltip anchorSelect={anchorSelect} className="max-w-[240px] font-mulish" clickable={isMobile}>
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
