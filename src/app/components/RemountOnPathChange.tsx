"use client"

import { usePathname, useSearchParams } from "next/navigation"
import type Book from "types/Book"
import type { UserProfileProps } from "lib/models/UserProfile"

type BookPageProps = {
  book: Book
  currentUserProfile: UserProfileProps
}

type Props = BookPageProps & { ComponentToRemount: React.ComponentType<BookPageProps> }

export default function RemountOnPathChange({ ComponentToRemount, ...props }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // exact format doesn't matter as long as `pageKey` changes
  // whenever the pathname OR searchParams changes
  const pageKey = `${pathname}${searchParams.toString()}`

  return <ComponentToRemount key={pageKey} {...props} />
}
