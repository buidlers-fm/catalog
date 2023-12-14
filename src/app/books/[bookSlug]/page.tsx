import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookNotes } from "lib/server/bookNotes"
import { decorateWithLikes, decorateLists } from "lib/server/decorators"
import BookPage from "app/books/components/BookPage"
import RemountOnPathChange from "app/components/RemountOnPathChange"
import InteractionObjectType from "enums/InteractionObjectType"
import BookNoteType from "enums/BookNoteType"
import Sort from "enums/Sort"

export const dynamic = "force-dynamic"

export default async function BookPageBySlug({ params }: any) {
  const { bookSlug } = params
  const userProfile = await getCurrentUserProfile()

  const dbBook = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
    include: {
      bookReads: {
        where: {
          readerId: userProfile?.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
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
      console.error(error)
    }
  }

  if (openLibraryBook) {
    await prisma.book.update({
      where: {
        id: dbBook.id,
      },
      data: {
        title: openLibraryBook.title || undefined,
        authorName: openLibraryBook.authorName || undefined,
        subtitle: openLibraryBook.subtitle || undefined,
        description: openLibraryBook.description || undefined,
        coverImageUrl: openLibraryBook.coverImageUrl || undefined,
        editionsCount: openLibraryBook.editionsCount || undefined,
        firstPublishedYear: openLibraryBook.firstPublishedYear || undefined,
        isTranslated: openLibraryBook.isTranslated,
        originalTitle: openLibraryBook.originalTitle || undefined,
      },
    })
  }

  let book = { ...dbBook, ...openLibraryBook }

  console.log(book)

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

    userLists = await decorateLists(_userLists, userProfile)
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

  const bookLists = await decorateLists(_bookLists, userProfile)

  book.bookNotes = await getBookNotes({
    bookId: book.id,
    sort: Sort.Popular,
    noteTypes: [BookNoteType.JournalEntry],
    currentUserProfile: userProfile,
  })

  book.bookPosts = await getBookNotes({
    bookId: book.id,
    sort: Sort.Popular,
    noteTypes: [BookNoteType.LinkPost, BookNoteType.TextPost],
    currentUserProfile: userProfile,
  })

  book = (await decorateWithLikes([book], InteractionObjectType.Book, userProfile))[0]
  console.log(book)

  return (
    <RemountOnPathChange
      ComponentToRemount={BookPage}
      book={book}
      userLists={userLists}
      bookLists={bookLists}
      isSignedIn={!!userProfile}
      currentUserProfile={userProfile}
    />
  )
}
