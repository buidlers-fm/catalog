import * as Sentry from "@sentry/nextjs"

function reportToSentry(error, data: any = {}) {
  console.error(error)
  console.log(data)

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
