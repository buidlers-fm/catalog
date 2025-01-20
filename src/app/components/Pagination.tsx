"use client"

import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io"

// there will be ellipses when there are this many pages or more
const OVERFLOW_THRESHOLD = 7
// when the current page is this far from the first or last pages, it will show the "middle pages" -
// the current page in the center with previous and next pages and ellipses on either side.
// note: changing this may result in the pagination not displaying correctly
const MIDDLE_PAGES_DISPLAY_THRESHOLD = 3

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const range = (start, stop) => Array.from({ length: stop + 1 - start }, (_, i) => start + i)

function PageLink({ page, href, currentPage }) {
  return (
    <Link
      href={href}
      aria-current={page === currentPage ? "page" : undefined}
      className={classNames(
        page === currentPage ? "text-white border-gold-500" : "text-gray-300 border-transparent",
        "border-t-2 px-3 pt-2.5 text-sm hover:text-white",
      )}
    >
      {page}
    </Link>
  )
}

function Ellipsis() {
  return (
    <span className="border-t-2 border-transparent px-3 pt-2.5 text-sm text-gray-300">...</span>
  )
}

function PageNumbers({ pageCount, currentPage, getHref }) {
  if (pageCount <= OVERFLOW_THRESHOLD) {
    // 1 2 3 4 5 6
    return (
      <>
        {range(1, pageCount).map((page) => (
          <PageLink key={page} page={page} href={getHref(page)} currentPage={currentPage} />
        ))}
      </>
    )
  }

  if (currentPage <= MIDDLE_PAGES_DISPLAY_THRESHOLD) {
    // 1 2 3 4 ... 7
    return (
      <>
        {range(1, MIDDLE_PAGES_DISPLAY_THRESHOLD + 1).map((page) => (
          <PageLink key={page} page={page} href={getHref(page)} currentPage={currentPage} />
        ))}
        <Ellipsis />
        <PageLink page={pageCount} href={getHref(pageCount)} currentPage={currentPage} />
      </>
    )
  }
  if (
    currentPage > MIDDLE_PAGES_DISPLAY_THRESHOLD &&
    currentPage <= pageCount - MIDDLE_PAGES_DISPLAY_THRESHOLD
  ) {
    // 1 ... 3 4 5 ... 7
    return (
      <>
        <PageLink page={1} href={getHref(1)} currentPage={currentPage} />
        <Ellipsis />
        {range(currentPage - 1, currentPage + 1).map((page) => (
          <PageLink key={page} page={page} href={getHref(page)} currentPage={currentPage} />
        ))}
        <Ellipsis />
        <PageLink page={pageCount} href={getHref(pageCount)} currentPage={currentPage} />
      </>
    )
  }
  if (currentPage >= pageCount - MIDDLE_PAGES_DISPLAY_THRESHOLD) {
    // 1 ... 4 5 6 7
    return (
      <>
        <PageLink page={1} href={getHref(1)} currentPage={currentPage} />
        <Ellipsis />
        {range(pageCount - MIDDLE_PAGES_DISPLAY_THRESHOLD, pageCount).map((page) => (
          <PageLink key={page} page={page} href={getHref(page)} currentPage={currentPage} />
        ))}
      </>
    )
  }
}

export default function Pagination({ pageCount }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 1

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  const getHref = (page) =>
    page === 1 ? pathname : `${pathname}?${createQueryString("page", page.toString())}`

  if (pageCount === 1) return null

  return (
    <nav className="flex justify-center border-t border-gray-500 font-mulish">
      <Link
        href={getHref(currentPage - 1)}
        className={classNames(
          // arrow element needs to exist but be invisible for page numbers to be centered properly
          currentPage > 1 ? "visible" : "invisible pointer-events-none	",
          "mr-3 pt-2.5 text-2xl",
        )}
      >
        <IoIosArrowRoundBack aria-hidden="true" className="text-gray-300 hover:text-white" />
      </Link>

      <div className="flex">
        <PageNumbers pageCount={pageCount} currentPage={currentPage} getHref={getHref} />
      </div>

      <Link
        href={getHref(currentPage + 1)}
        className={classNames(
          currentPage < pageCount ? "visible" : "invisible pointer-events-none	",
          "ml-3 pt-2.5 text-2xl",
        )}
      >
        <IoIosArrowRoundForward aria-hidden="true" className="text-gray-300 hover:text-white" />
      </Link>
    </nav>
  )
}
