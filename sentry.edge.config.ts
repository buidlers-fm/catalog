// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

const env = process.env.NEXT_PUBLIC_CATALOG_ENV || process.env.VERCEL_ENV

if (env !== "development") {
  Sentry.init({
    dsn: "https://731f10bb6d61d106a883ea30e175ccc8@o4506421166473216.ingest.sentry.io/4506421171650560",
    environment: env,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    normalizeDepth: 5,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  })
}
