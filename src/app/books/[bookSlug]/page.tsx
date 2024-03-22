import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { reportToSentry } from "lib/sentry"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateWithLikes } from "lib/server/decorators"
import { getMetadata } from "lib/server/metadata"
import BookPage from "app/books/components/BookPage"
import RemountOnPathChange from "app/components/RemountOnPathChange"
import InteractionObjectType from "enums/InteractionObjectType"
import type { Metadata } from "next"
import type Book from "types/Book"

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

  // fetch from OL, and update if book has never been edited on catalog
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

    if (book.edited) {
      // use book data, but use OL data for missing fields
      book = {
        ...openLibraryBook,
        ...book,
      }
    } else {
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
        prisma.book.update({
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

      // override book with latest from OL
      book = {
        ...book,
        ...openLibraryBook,
      }
    }

    // handle cover image urls separately
    book = {
      ...book,
      coverImageUrl: useExistingCoverImageUrl ? book.coverImageUrl : openLibraryBook.coverImageUrl,
      openLibraryCoverImageUrl: useExistingCoverImageUrl
        ? book.openLibraryCoverImageUrl
        : openLibraryBook.coverImageUrl,
    }
  }

  book = (await decorateWithLikes([book], InteractionObjectType.Book, userProfile))[0]

  return (
    <RemountOnPathChange
      ComponentToRemount={BookPage}
      book={book as Book}
      currentUserProfile={userProfile}
    />
  )
}
