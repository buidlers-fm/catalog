import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params
  const { hasNewAnnouncements } = reqJson

  const userConfig = await prisma.userConfig.findFirst({
    where: {
      userProfileId: currentUserProfile.id,
    },
  })

  if (!userConfig) {
    reportToSentry(new Error(`User config not found`), { reqJson, currentUserProfile })
  }

  console.log({ hasNewAnnouncements })

  await prisma.userConfig.update({
    where: {
      userProfileId: currentUserProfile.id,
    },
    data: { hasNewAnnouncements },
  })

  return NextResponse.json({}, { status: 200 })
})
