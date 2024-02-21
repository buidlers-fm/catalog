"use client"

import { FaDiscord } from "react-icons/fa"
import { BsEnvelopeFill } from "react-icons/bs"
import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="flex flex-col h-screen">
          <main className="mb-auto font-newsreader font-normal text-md tracking-wide leading-relaxed">
            <div className="max-w-xl mx-auto py-32 px-8 text-center">
              <div className="text-xl">Oops! Something went wrong.</div>
              <div className="mt-4 text-md text-gray-300">
                It's likely that we got the error report and will look into it, but you can get in
                touch by{" "}
                <a href="mailto:staff@catalog.fyi" className="cat-link">
                  email
                </a>{" "}
                or{" "}
                <a href="https://discord.gg/BWTSEkDT9W" className="cat-link">
                  Discord
                </a>{" "}
                if you need help from our team.
              </div>
            </div>
          </main>
          <footer className="mt-32 px-6 xs:px-8 py-4 flex font-chivo-mono tracking-wider">
            ©&nbsp;
            <a href="/">catalog</a>.
            <div className="ml-4 xs:ml-6">
              <a href="/news" className="cat-btn-link text-sm">
                news
              </a>
            </div>
            <div className="ml-4 xs:ml-6">
              <a href="/changelog" className="cat-btn-link text-sm">
                changelog
              </a>
            </div>
            <div className="ml-4 xs:ml-6">
              <a href="mailto:staff@catalog.fyi">
                <BsEnvelopeFill className="mt-[5px] text-lg" />
              </a>
            </div>
            <div className="ml-4 xs:ml-6">
              <a href="https://discord.gg/BWTSEkDT9W">
                <FaDiscord className="mt-0.5 text-2xl" />
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
