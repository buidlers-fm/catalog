import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getMetadata } from "lib/server/metadata"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import EditLogCard from "app/components/EditLogCard"
import UserProfile, { UserProfileProps } from "lib/models/UserProfile"
import EditedObjectType from "enums/EditedObjectType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.edits",
    params,
  })
}

export default async function UserEditsPage({ params }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const userProfile = (await prisma.userProfile.findFirst({
    where: {
      username,
    },
    include: {
      editLogs: {
        include: {
          editor: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })) as UserProfileProps

  if (!userProfile) notFound()
  const isUsersProfile = currentUserProfile?.id === userProfile.id

  const decoratedUserProfile = UserProfile.build(userProfile)

  const { name, editLogs: _editLogs = [] } = decoratedUserProfile

  const bookIds = _editLogs
    .filter((editLog) => editLog.editedObjectType === EditedObjectType.Book)
    .map((editLog) => editLog.editedObjectId)

  const books = await prisma.book.findMany({
    where: {
      id: {
        in: bookIds,
      },
    },
  })

  const booksById = books.reduce((acc, book) => {
    acc[book.id] = book
    return acc
  }, {})

  const editLogs = _editLogs.map((editLog) => ({
    ...editLog,
    book: booksById[editLog.editedObjectId],
  }))

  return (
    <div className="mt-4 max-w-lg mx-auto font-mulish">
      Book edits {isUsersProfile ? "you've" : `${name} has`} made.
      <div className="mt-4">
        {editLogs ? (
          editLogs.length > 0 ? (
            <div className="">
              {editLogs.map((editLog) => (
                <EditLogCard key={editLog.id} editLog={editLog} />
              ))}
            </div>
          ) : (
            <EmptyState
              text={`${isUsersProfile ? "You haven't" : `${name} hasn't`} made any edits yet.`}
            />
          )
        ) : (
          <LoadingSection />
        )}
      </div>
    </div>
  )
}
