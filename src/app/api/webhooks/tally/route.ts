import { NextResponse } from "next/server"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import * as ghost from "lib/ghost"
import prisma from "lib/prisma"
import logger from "lib/logger"
import { isProduction } from "lib/helpers/general"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { reqJson } = params

    const {
      data: { fields },
    } = reqJson

    const [nameField, howDoYouKnowUsField, relationshipToBooksField, emailField, , subscribeField] =
      fields

    if (!subscribeField.label.match(/newsletter/i)) {
      reportToSentry(new Error("Couldn't find newsletter subscribe field"), {
        method: "api.webhooks.tally",
        reqJson,
      })

      return NextResponse.json({}, { status: 400 })
    }

    if (!emailField.label.match(/email/i)) {
      reportToSentry(new Error("Couldn't find email field"), {
        method: "api.webhooks.tally",
        reqJson,
      })

      return NextResponse.json({}, { status: 400 })
    }

    let subscribed = false

    const { value: subscribe } = subscribeField

    if (subscribe && isProduction()) {
      const { value: email } = emailField

      try {
        await ghost.subscribe(email)
        subscribed = true
        logger.info(`api.webhooks.tally: Subscribed ${email} to Ghost.`)
      } catch (error: any) {
        reportToSentry(error, {
          method: "api.webhooks.tally.subscribe",
          email,
        })
      }
    }

    const waitlister = {
      name: nameField.value,
      email: emailField.value,
      subscribed,
      data: {
        how_do_you_know_us: howDoYouKnowUsField.value,
        relationship_to_books: relationshipToBooksField.value,
        subscribe: subscribeField.value,
      },
    }

    await prisma.waitlister.create({
      data: waitlister,
    })

    return NextResponse.json({}, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
  },
)
