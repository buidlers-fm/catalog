"use client"

import { useEffect } from "react"
import { reportToSentry } from "lib/sentry"

export default function ErrorPage({ error }) {
  useEffect(() => {
    reportToSentry(error)
  }, [error])

  return (
    <div className="py-32 px-8 text-center text-xl">
      Oops! Something went wrong:
      <div className="my-2 text-red-500 font-mulish">{error.message}</div>
    </div>
  )
}
