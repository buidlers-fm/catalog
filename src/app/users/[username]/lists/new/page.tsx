import { redirect } from "next/navigation"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { getUserListsLink } from "lib/helpers/general"
import EditList from "app/users/[username]/lists/new/components/EditList"
import type Book from "types/Book"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "new list • catalog",
  openGraph: {
    title: "new list • catalog",
  },
}

export default async function CreateListPage({ params, searchParams }) {
  // redirect if not on own profile
  const { username } = params

  const currentUserProfile = await getCurrentUserProfile({
    requireSignedIn: true,
    redirectPath: `/users/${username}/lists`,
  })

  if (username !== currentUserProfile.username) redirect(getUserListsLink(username))

  const { with: openLibraryWorkId } = searchParams

  if (openLibraryWorkId) {
    const openLibraryBook: Book = await OpenLibrary.getFullBook(openLibraryWorkId)
    return <EditList currentUserProfile={currentUserProfile} firstBook={openLibraryBook} />
  } else {
    return <EditList currentUserProfile={currentUserProfile} />
  }
}
