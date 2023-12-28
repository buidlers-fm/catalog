import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { decorateLists } from "lib/server/decorators"
import ListBook from "app/lists/components/ListBook"
import EmptyState from "app/components/EmptyState"
import UserBookShelf from "enums/UserBookShelf"
import type { UserProfileProps as UserProfile } from "lib/models/UserProfile"

export const dynamic = "force-dynamic"

const shelfToUserBookShelf = {
  "to-read": UserBookShelf.ToRead,
  "up-next": UserBookShelf.UpNext,
  "currently-reading": UserBookShelf.CurrentlyReading,
  read: UserBookShelf.Read,
  abandoned: UserBookShelf.Abandoned,
}

export default async function UserShelfPage({ params }) {
  const { username, shelf } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })) as UserProfile

  if (!userProfile) notFound()

  const userBookShelf = shelfToUserBookShelf[shelf]

  if (!userBookShelf) notFound()

  let books
  if (shelf === UserBookShelf.Read) {
    const _readList = await prisma.list.findFirst({
      where: {
        ownerId: userProfile.id,
        slug: "_read",
      },
      include: {
        listItemAssignments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    const [readList] = await decorateLists([_readList], null)
    ;({ books } = readList)
  } else {
    const userBookShelfAssignments = await prisma.userBookShelfAssignment.findMany({
      where: {
        userProfileId: userProfile.id,
        shelf: userBookShelf,
      },
      include: {
        book: true,
      },
    })

    books = userBookShelfAssignments.map((assignment) => assignment.book)
  }

  const isUsersProfile = userProfile.id === currentUserProfile?.id

  let emptyStateText = "No books in this shelf."
  if (isUsersProfile) {
    emptyStateText = `${emptyStateText} To add a book, visit the book's page.`
  }

  return (
    <div className="mt-4 xs:mx-8 lg:mx-16 font-mulish">
      {books.length === 0 ? (
        <EmptyState text={emptyStateText} small />
      ) : (
        <>
          {isUsersProfile && shelf === UserBookShelf.Read && (
            <div className="mt-8 mb-4 text-sm">
              Unlike with all other shelves, books in your `read` shelf will remain in it even if
              you add the book to another shelf.
            </div>
          )}
          <div className="sm:my-4 p-0 grid grid-cols-4 xs:grid-cols-3 lg:grid-cols-5 -mx-2">
            {books.map((book) => (
              <ListBook key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
