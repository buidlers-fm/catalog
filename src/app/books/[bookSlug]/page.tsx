import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/helpers/general"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

export default async function BookPageBySlug({ params }: any) {
  const { bookSlug } = params

  const dbBook = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!dbBook) throw new Error("Book not found")

  const workId = dbBook.openLibraryWorkId!
  const openLibraryBook: Book = await OpenLibrary.getFullBook(workId)

  const book = { ...dbBook, ...openLibraryBook }

  console.log(book)

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

  const _bookLists = await prisma.list.findMany({
    where: {
      designation: null,
      listItemAssignments: {
        some: {
          listedObjectType: "book",
          listedObjectId: book.id,
        },
      },
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const bookLists = await decorateLists(_bookLists)

  return (
    <BookPage book={book} userLists={userLists} bookLists={bookLists} isSignedIn={!!userProfile} />
  )
}
