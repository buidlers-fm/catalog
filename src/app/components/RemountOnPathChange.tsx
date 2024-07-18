"use client"

import { usePathname, useSearchParams } from "next/navigation"

export default function RemountOnPathChange({ ComponentToRemount, ...props }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // exact format doesn't matter as long as `pageKey` changes
  // whenever the pathname OR searchParams changes
  const pageKey = `${pathname}${searchParams.toString()}`

  return <ComponentToRemount key={pageKey} {...props} />
}
