import { redirect } from "next/navigation"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { getUserListsLink } from "lib/helpers/general"
import EditList from "app/users/[username]/lists/new/components/EditList"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function CreateListPage({ params, searchParams }) {
  const currentUserProfile = await getCurrentUserProfile()

  // redirect if not signed in
  if (!currentUserProfile) redirect("/")

  // redirect if not on own profile
  const { username } = params
  if (username !== currentUserProfile.username) redirect(getUserListsLink(username))

  const { with: openLibraryWorkId } = searchParams

  if (openLibraryWorkId) {
    const openLibraryBook: Book = await OpenLibrary.getFullBook(openLibraryWorkId)
    return <EditList currentUserProfile={currentUserProfile} firstBook={openLibraryBook} />
  } else {
    return <EditList currentUserProfile={currentUserProfile} />
  }
}
