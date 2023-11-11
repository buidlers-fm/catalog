import { redirect } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookLink, decorateLists } from "lib/helpers/general"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function BookPageByQuery({ searchParams }) {
  const { open_library_work_id: openLibraryWorkId } = searchParams

  if (!openLibraryWorkId) throw new Error("openLibraryWorkId must be included")

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId,
    },
  })

  if (existingBook) redirect(getBookLink(existingBook.slug))

  const openLibraryBook: Book = await OpenLibrary.getFullBook(openLibraryWorkId)

  const userProfile = await getCurrentUserProfile()

  let userLists: any[] = []

  if (userProfile) {
    const _userLists = await prisma.list.findMany({
      where: {
        ownerId: userProfile.id,
        designation: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    userLists = await decorateLists(_userLists)

    console.log(userLists)
  }

  return <BookPage book={openLibraryBook} isSignedIn={!!userProfile} userLists={userLists} />
}
