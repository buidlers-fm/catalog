import { redirect } from "next/navigation"
import OpenLibrary from "lib/openlibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import EditList from "app/users/[username]/lists/new/components/EditList"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function CreateListPage({ searchParams }) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile) redirect("/")

  const { with: openLibraryWorkId } = searchParams

  if (openLibraryWorkId) {
    const openlibraryBook: Book = await OpenLibrary.getFullBook(openLibraryWorkId)
    return <EditList currentUserProfile={userProfile} firstBook={openlibraryBook} />
  } else {
    return <EditList currentUserProfile={userProfile} />
  }
}
