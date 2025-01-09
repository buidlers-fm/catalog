import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getMetadata } from "lib/server/metadata"
import UserProfile from "lib/models/UserProfile"
import FeatureFlag from "enums/FeatureFlag"
// import InteractionType from "enums/InteractionType"
// import InteractionAgentType from "enums/InteractionAgentType"
// import InteractionObjectType from "enums/InteractionObjectType"
// import BookReadStatus from "enums/BookReadStatus"
// import BookNoteType from "enums/BookNoteType"
// import EditedObjectType from "enums/EditedObjectType"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.2024",
    params,
  })
}

export default async function UserYearPage({ params }) {
  const yearInBooksFeatureFlag = await prisma.featureFlag.findFirst({
    where: {
      name: FeatureFlag.YearInBooks,
    },
  })

  if (!yearInBooksFeatureFlag?.enabled) notFound()

  const { username, year } = params
  if (!year || year !== "2024") notFound()

  const _userProfile = await prisma.userProfile.findFirst({
    where: {
      username,
    },
  })

  if (!_userProfile) notFound()

  const userProfile = UserProfile.build(_userProfile)

  const { name } = userProfile

  // const yearStart = new Date("2024-01-01T00:00:00.000Z")
  // const yearEnd = new Date("2025-01-01T00:00:00.000Z")

  // const allFinishedBookReads = await prisma.bookRead.findMany({
  //   where: {
  //     readerId: userProfile.id,
  //     endDate: {
  //       gte: yearStart,
  //       lt: yearEnd,
  //     },
  //     status: BookReadStatus.Finished,
  //   },
  //   orderBy: {
  //     endDate: "desc",
  //   },
  //   include: {
  //     book: true,
  //   },
  // })

  // const allBooksFinished = allFinishedBookReads.map((bookRead) => bookRead.book)

  // const allBookReads = await prisma.bookRead.findMany({
  //   where: {
  //     readerId: userProfile.id,
  //     endDate: {
  //       gte: yearStart,
  //       lt: yearEnd,
  //     },
  //   },
  // })

  // const numBooksStarted = allBookReads.length

  // const numBooksFinished = allBookReads.filter(
  //   (bookRead) => bookRead.status === BookReadStatus.Finished,
  // ).length

  // const avgBooksFinishedPerMonth = parseFloat((numBooksFinished / 12).toFixed(1))

  // const numBooksAbandoned = allBookReads.filter(
  //   (bookRead) => bookRead.status === BookReadStatus.Abandoned,
  // ).length

  // const numBooksLiked = await prisma.interaction.count({
  //   where: {
  //     agentId: userProfile.id,
  //     interactionType: InteractionType.Like,
  //     agentType: InteractionAgentType.User,
  //     objectType: InteractionObjectType.Book,
  //     createdAt: {
  //       gte: yearStart,
  //       lt: yearEnd,
  //     },
  //   },
  // })

  // const numNotesCreated = await prisma.bookNote.count({
  //   where: {
  //     creatorId: userProfile.id,
  //     createdAt: {
  //       gte: yearStart,
  //       lt: yearEnd,
  //     },
  //     noteType: BookNoteType.JournalEntry,
  //     AND: [
  //       {
  //         text: {
  //           not: null,
  //         },
  //       },
  //       {
  //         text: {
  //           not: "",
  //         },
  //       },
  //     ],
  //   },
  // })

  // const numListsCreated = await prisma.list.count({
  //   where: {
  //     creatorId: userProfile.id,
  //     createdAt: {
  //       gte: yearStart,
  //       lt: yearEnd,
  //     },
  //   },
  // })

  // const numBooksEdited = (
  //   await prisma.editLog.groupBy({
  //     by: ["editedObjectId"],
  //     where: {
  //       editorId: userProfile.id,
  //       editedObjectType: EditedObjectType.Book,
  //       createdAt: {
  //         gte: yearStart,
  //         lt: yearEnd,
  //       },
  //     },
  //   })
  // ).length

  return (
    <div>
      {name}'s {year} in books
    </div>
  )
}
