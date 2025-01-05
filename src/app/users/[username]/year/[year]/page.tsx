import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { getMetadata } from "lib/server/metadata"
import UserProfile from "lib/models/UserProfile"
import FeatureFlag from "enums/FeatureFlag"
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

  return (
    <div>
      {name}'s {year} in books
    </div>
  )
}
