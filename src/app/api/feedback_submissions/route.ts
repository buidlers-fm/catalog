import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import type { NextRequest } from "next/server"

const DISCORD_URL = process.env.DISCORD_FEEDBACK_WEBHOOK_URL!

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params

  const { text } = reqJson

  const createdFeedbackSubmission = await prisma.feedbackSubmission.create({
    data: {
      text,
      userProfileId: currentUserProfile.id,
    },
  })

  // post to discord
  let name = `@${currentUserProfile.username}`
  if (currentUserProfile.displayName) {
    name = `${currentUserProfile.displayName} (${name})`
  }

  const discordData = {
    username: `feedback from ${name}`,
    content: text,
  }

  try {
    await fetch(DISCORD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordData),
    })
  } catch (error: any) {
    reportToSentry(error, {
      method: "api.feedback_submissions.post_to_discord",
      ...discordData,
    })
  }

  const resBody = humps.decamelizeKeys(createdFeedbackSubmission)

  return NextResponse.json(resBody, { status: 200 })
})
