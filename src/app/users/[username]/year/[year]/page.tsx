import { notFound } from "next/navigation"
import { FaUserCircle } from "react-icons/fa"
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

  const { name, avatarUrl } = userProfile

  const books = [{}]

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
    <div className="mt-4 font-mulish xs:w-[400px] sm:w-[600px] ml:w-[832px] mx-8 xs:mx-auto py-8">
      <div className="flex justify-center items-center space-x-3 sm:space-x-5">
        {/* place avatar after centering username */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="user avatar"
            className="w-12 h-12 sm:w-16 sm:h-16 ml:w-20 ml:h-20 rounded-full"
          />
        ) : (
          <FaUserCircle className="w-12 h-12 sm:w-16 sm:h-16 ml:w-20 ml:h-20 text-gold-100" />
        )}
        <div className="text-lg sm:text-[2rem] ml:text-[2.5rem]">{name}’s</div>
      </div>
      <div className="text-center font-chivo-mono font-bold text-gold-500 text-4xl xs:text-5xl sm:text-7xl ml:text-[5rem] sm: mb-10 ml:mb-12 mt-4">
        {year} in books
      </div>

      <div className="text-3xl -mb-2 font-semibold font-newsreader">reading</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300 mb-8 mb-10" />
      <div className="relative">
        <LongArrow className="absolute text-gray-300 mx-auto left-[50%] ml-[-15px] top-[14px] ml-[-37px] hidden sm:block" />
        <div className="flex flex-col items-center sm:items-start gap-8 sm:gap-0 sm:flex-row sm:justify-between relative">
          <NumberLabel number={16} label="started" />
          <NumberLabel number={16} label="finished" />
          <NumberLabel number={16} label="avg per month" />
          <NumberLabel number={16} label="abandoned" />
        </div>
      </div>

      <div className="text-3xl -mb-2 font-semibold font-newsreader mt-16">activity</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300 mb-10" />
      <div className="flex flex-col items-center sm:items-start gap-8 sm:gap-0 sm:flex-row sm:justify-between relative">
        <NumberLabel number={16} label="books liked" />
        <NumberLabel number={16} label="notes written" />
        <NumberLabel number={16} label="lists created" />
        <NumberLabel number={16} label="books edited" />
      </div>

      <div className="text-3xl -mb-2 font-semibold font-newsreader mt-16">books read</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300 mb-10" />
      <div className="">{}</div>
    </div>
  )
}

export function NumberLabel({ number, label }) {
  return (
    <div className="sm:w-[126px]">
      <div className="text-center font-newsreader text-4xl sm:text-5xl font-semibold -mb-1 sm:mb-0 mx-auto">
        {number}
      </div>
      <div className="text-center font-mulish text-md sm:text-lg text-gray-300 mx-auto">
        {label}
      </div>
    </div>
  )
}

export function LongArrow({ className }) {
  return (
    <svg
      width="75"
      height="16"
      viewBox="0 0 75 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M74.7071 8.70711C75.0976 8.31658 75.0976 7.68342 74.7071 7.29289L68.3431 0.928932C67.9526 0.538408 67.3195 0.538408 66.9289 0.928932C66.5384 1.31946 66.5384 1.95262 66.9289 2.34315L72.5858 8L66.9289 13.6569C66.5384 14.0474 66.5384 14.6805 66.9289 15.0711C67.3195 15.4616 67.9526 15.4616 68.3431 15.0711L74.7071 8.70711ZM0 9H74V7H0V9Z"
        fill="currentColor"
      />
    </svg>
  )
}
