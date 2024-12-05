"use client"

import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6"

const OVERFLOW_THRESHOLD = 7

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
        page === currentPage && "font-bold",
        "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm  text-gray-500 hover:border-gray-300 hover:text-gray-700",
      )}
    >
      {page}
    </Link>
  )
}

function Ellipsis() {
  return (
    <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
      ...
    </span>
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

  if (currentPage <= 3) {
    // 1 2 3 4 ... 7
    return (
      <>
        {range(1, 4).map((page) => (
          <PageLink key={page} page={page} href={getHref(page)} currentPage={currentPage} />
        ))}
        <Ellipsis />
        <PageLink page={pageCount} href={getHref(pageCount)} currentPage={currentPage} />
      </>
    )
  }
  if (currentPage >= 4 && currentPage <= pageCount - 3) {
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
  if (currentPage > pageCount - 4) {
    // 1 ... 4 5 6 7
    return (
      <>
        <PageLink page={1} href={getHref(1)} currentPage={currentPage} />
        <Ellipsis />
        {range(pageCount - 3, pageCount).map((page) => (
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
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        {currentPage > 1 && (
          <Link
            href={getHref(currentPage - 1)}
            className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <FaArrowLeft aria-hidden="true" className="mr-3 size-5 text-gray-400" />
          </Link>
        )}
      </div>
      <div className="flex">
        <PageNumbers pageCount={pageCount} currentPage={currentPage} getHref={getHref} />
        {/* Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" */}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage < pageCount && (
          <Link
            href={getHref(currentPage + 1)}
            className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <FaArrowRight aria-hidden="true" className="ml-3 size-5 text-gray-400" />
          </Link>
        )}
      </div>
    </nav>
  )
}
