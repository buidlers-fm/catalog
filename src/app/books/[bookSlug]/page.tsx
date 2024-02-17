import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateBook, decorateWithLikes, decorateLists } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import BookPage from "app/books/components/BookPage"
import RemountOnPathChange from "app/components/RemountOnPathChange"
import InteractionObjectType from "enums/InteractionObjectType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "book",
    params,
  })
}

export default async function BookPageBySlug({ params }: any) {
  const { bookSlug } = params
  const userProfile = await getCurrentUserProfile()

  const dbBook = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
    include: {
      adaptations: {
        orderBy: {
          year: "desc",
        },
      },
      bookReads: {
        where: {
          readerId: userProfile?.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      userShelfAssignments: {
        where: {
          userProfileId: userProfile?.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!dbBook) notFound()

  let book = dbBook

  // fetch and update from OL if book has never been edited on catalog
  if (!book.edited) {
    const workId = dbBook.openLibraryWorkId!

    let openLibraryBook: any = {}
    try {
      openLibraryBook = await OpenLibrary.getFullBook(workId)
    } catch (error: any) {
      // if not found, let openLibraryBook stay blank
      if (error.message !== "notfound") {
        reportToSentry(error, { workId })
      }
    }

    if (openLibraryBook) {
      const useExistingCoverImageUrl =
        dbBook.coverImageUrl && !dbBook.coverImageUrl.match(/openlibrary/)

      const updateBookData = {
        title: openLibraryBook.title || undefined,
        authorName: openLibraryBook.authorName || undefined,
        subtitle: openLibraryBook.subtitle || undefined,
        description: openLibraryBook.description || undefined,
        coverImageUrl:
          useExistingCoverImageUrl || !openLibraryBook.coverImageUrl
            ? undefined
            : openLibraryBook.coverImageUrl,
        openLibraryCoverImageUrl:
          useExistingCoverImageUrl || !openLibraryBook.coverImageUrl
            ? undefined
            : openLibraryBook.coverImageUrl,
        editionsCount: openLibraryBook.editionsCount || undefined,
        firstPublishedYear: openLibraryBook.firstPublishedYear || undefined,
        isTranslated: openLibraryBook.isTranslated,
        originalTitle: openLibraryBook.originalTitle || undefined,
      }

      try {
        await prisma.book.update({
          where: {
            id: dbBook.id,
          },
          data: updateBookData,
        })
      } catch (error: any) {
        reportToSentry(error, {
          method: "BookPageBySlug.update_book_data",
          ...updateBookData,
        })
      }

      // override book with latest from OL _except_ for cover image urls
      book = {
        ...book,
        ...openLibraryBook,
        coverImageUrl: useExistingCoverImageUrl
          ? book.coverImageUrl
          : openLibraryBook.coverImageUrl,
        openLibraryCoverImageUrl: useExistingCoverImageUrl
          ? book.openLibraryCoverImageUrl
          : openLibraryBook.coverImageUrl,
      }
    }
  }

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

  book = await decorateBook(book, userProfile)
  book = (await decorateWithLikes([book], InteractionObjectType.Book, userProfile))[0]

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
