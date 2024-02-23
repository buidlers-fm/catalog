// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

const env = process.env.NEXT_PUBLIC_CATALOG_ENV || process.env.VERCEL_ENV

if (env !== "development") {
  Sentry.init({
    dsn: "https://731f10bb6d61d106a883ea30e175ccc8@o4506421166473216.ingest.sentry.io/4506421171650560",
    environment: env,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    normalizeDepth: 5,

    ignoreErrors: [
      "ResizeObserver loop completed with undelivered notifications.",
      "ResizeObserver loop limit exceeded",
      "Failed to fetch",
      "network error",
      "Warning: Mention: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
    ],

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.2,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      new Sentry.Replay({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
}
