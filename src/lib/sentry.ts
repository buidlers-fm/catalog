import * as Sentry from "@sentry/nextjs"
import logger from "lib/logger"

function reportToSentry(error, data: any = {}) {
  logger.error(error)
  logger.info(data)

  const sentryContext: any = {
    extra: data,
    user: data.currentUserProfile
      ? {
          id: data.currentUserProfile.id,
          username: data.currentUserProfile.username,
        }
      : undefined,
  }

  Sentry.captureException(error, sentryContext)
}

export { reportToSentry }
