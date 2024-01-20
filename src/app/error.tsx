"use client"

import { useEffect } from "react"
import { reportToSentry } from "lib/sentry"

export default function ErrorPage({ error }) {
  useEffect(() => {
    reportToSentry(error)
  }, [error])

  return (
    <div className="max-w-xl mx-auto py-32 px-8 text-center">
      <div className="text-xl">Oops! Something went wrong.</div>
      <div className="mt-4 text-md text-gray-300">
        It's likely that we got the error report and will look into it, but you can get in touch by{" "}
        <a href="mailto:staff@catalog.fyi" className="cat-link">
          email
        </a>{" "}
        or{" "}
        <a href="https://discord.gg/BWTSEkDT9W" className="cat-link">
          Discord
        </a>{" "}
        if you need help from our team.
      </div>
      <div className="mt-8">
        <a href="/home" className="cat-link">
          home
        </a>
      </div>
    </div>
  )
}
