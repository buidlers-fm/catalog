import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/helpers/general"
import BookPage from "app/books/components/BookPage"

export const dynamic = "force-dynamic"

export default async function BookPageBySlug({ params }: any) {
  const { bookSlug } = params

  const dbBook = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!dbBook) notFound()

  const workId = dbBook.openLibraryWorkId!

  let openLibraryBook: any = {}
  try {
    openLibraryBook = await OpenLibrary.getFullBook(workId)
  } catch (error: any) {
    // if not found, let openLibraryBook stay blank
    if (error.message !== "notfound") {
      throw error
    }
  }

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
