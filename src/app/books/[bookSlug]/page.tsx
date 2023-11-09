import { PrismaClient } from "@prisma/client"
import OpenLibrary from "lib/openlibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { attachBooksToLists } from "lib/helpers/general"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function BookPageBySlug({ params }: any) {
  const { bookSlug } = params

  const book = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!book) throw new Error("Book not found")

  const workId = book.openLibraryWorkId!
  const openlibraryBook: Book = await OpenLibrary.getFullBook(workId)

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

    userLists = await attachBooksToLists(_userLists)

    console.log(userLists)
  }

  return <BookPage book={openlibraryBook} userLists={userLists} isSignedIn={!!userProfile} />
}
