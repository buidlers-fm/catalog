import { redirect, notFound } from "next/navigation"
import humps from "humps"
import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { getCurrentUserProfile } from "lib/server/auth"
import { reportToSentry } from "lib/sentry"
import { getBookLink } from "lib/helpers/general"
import { decorateLists } from "lib/server/decorators"
import BookPage from "app/books/components/BookPage"
import RemountOnPathChange from "app/components/RemountOnPathChange"

export const dynamic = "force-dynamic"

export default async function BookPageByQuery({ searchParams }) {
  const { openLibraryWorkId, openLibraryEditionId: openLibraryBestEditionId } =
    humps.camelizeKeys(searchParams)

  if (!openLibraryWorkId) notFound()

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId,
    },
  })

  if (existingBook) redirect(getBookLink(existingBook.slug))

  let openLibraryBook: any = {}
  try {
    openLibraryBook = await OpenLibrary.getFullBook(openLibraryWorkId, openLibraryBestEditionId)
  } catch (error: any) {
    reportToSentry(error, { openLibraryWorkId, openLibraryBestEditionId })
    notFound()
  }

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

    userLists = await decorateLists(_userLists, userProfile)
  }

  const book = {
    ...openLibraryBook,
    likeCount: 0,
  }

  return (
    <RemountOnPathChange
      ComponentToRemount={BookPage}
      book={book}
      isSignedIn={!!userProfile}
      userLists={userLists}
    />
  )
}
