import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import OpenLibrary from "lib/openlibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookLink } from "lib/helpers/general"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function BookPageByQuery({ searchParams }) {
  const { open_library_work_id: openLibraryWorkId } = searchParams

  if (!openLibraryWorkId) throw new Error("openLibraryWorkId must be included")

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId,
    },
  })

  if (existingBook) redirect(getBookLink(existingBook.slug))

  const openlibraryBook: Book = await OpenLibrary.getFullBook(openLibraryWorkId)

  const userProfile = await getCurrentUserProfile()

  let userLists: any[] = []

  if (userProfile) {
    userLists = await prisma.list.findMany({
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

    const allBookIds = userLists
      .map((list) =>
        list.listItemAssignments
          .filter((lia) => lia.listedObjectType === "book")
          .map((lia) => lia.listedObjectId),
      )
      .flat()

    const allBooks = await prisma.book.findMany({
      where: {
        id: {
          in: allBookIds,
        },
      },
    })

    userLists.forEach((list: any) => {
      list.books = list.listItemAssignments
        .map((lia) => {
          if (lia.listedObjectType !== "book") return null

          return allBooks.find((b) => b.id === lia.listedObjectId)
        })
        .filter((b) => !!b)
    })

    console.log(userLists)
  }

  return <BookPage book={openlibraryBook} isSignedIn={!!userProfile} userLists={userLists} />
}
