import OpenLibrary from "lib/openlibrary"
import EditList from "app/lists/new/components/EditList"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function CreateListPage({ searchParams }) {
  // TODO: pass current user if signed in, otherwise redirect

  const { with: openlibraryWorkId } = searchParams

  if (openlibraryWorkId) {
    const openlibraryBook: Book = await OpenLibrary.getFullBook(openlibraryWorkId)
    return <EditList firstBook={openlibraryBook} />
  } else {
    return <EditList />
  }
}
