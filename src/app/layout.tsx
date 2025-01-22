import "app/globals.css"
import Link from "next/link"
import { Chivo_Mono, Newsreader, Mulish } from "next/font/google"
import { FaDiscord } from "react-icons/fa"
import { FaBluesky } from "react-icons/fa6"
import { BsEnvelopeFill } from "react-icons/bs"
import { UserProvider } from "lib/contexts/UserContext"
import { UnreadsProvider } from "lib/contexts/UnreadsContext"
import { UserBooksProvider } from "lib/contexts/UserBooksContext"
import { ModalsProvider } from "lib/contexts/ModalsContext"
import IntroTourProvider from "app/components/IntroTourProvider"
import CatalogHeader from "app/components/CatalogHeader"
import Modals from "app/components/Modals"
import Toast from "app/components/Toast"
import YearInBooksGlobalBanner from "app/components/YearInBooksGlobalBanner"
import type { Metadata } from "next"

const chivoMono = Chivo_Mono({ subsets: ["latin"], variable: "--font-chivo-mono" })
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
})
const mulish = Mulish({ subsets: ["latin"], variable: "--font-mulish" })

const fonts = [chivoMono, newsreader, mulish]
const fontsClassNames = fonts.map((font) => font.variable).join(" ")

export const metadata: Metadata = {
  title: "catalog",
  description: "a space for book people.",
  openGraph: {
    title: "catalog",
    description: "a space for book people.",
    url: "https://catalog.fyi",
    siteName: "catalog",
    locale: "en_US",
    type: "website",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontsClassNames} bg-black text-white`}>
        <UserProvider>
          <UnreadsProvider>
            <UserBooksProvider>
              <ModalsProvider>
                <IntroTourProvider>
                  <div className="flex flex-col h-screen">
                    <CatalogHeader />
                    <YearInBooksGlobalBanner />
                    <main className="mb-auto font-newsreader font-normal text-md tracking-wide leading-relaxed">
                      {children}
                    </main>
                    <footer className="mt-16 sm:mt-32 px-6 xs:px-8 py-4 flex flex-col xs:flex-row font-chivo-mono tracking-wider">
                      <div className="flex flex-col items-center xs:flex-row">
                        <div className="">
                          ©&nbsp;
                          <Link href="/" className="-ml-1.5">
                            catalog
                          </Link>
                          .
                        </div>
                        <div className="xs:ml-6">
                          <Link href="/news" className="cat-btn-link text-sm">
                            news
                          </Link>
                        </div>
                        <div className="xs:ml-6">
                          <Link href="/changelog" className="cat-btn-link text-sm">
                            changelog
                          </Link>
                        </div>
                      </div>
                      <div className="xs:ml-6 mt-2 xs:mt-0 mx-auto flex">
                        <div className="">
                          <a
                            href="mailto:staff@catalog.fyi"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <BsEnvelopeFill className="mt-[5px] text-lg" />
                          </a>
                        </div>
                        <div className="ml-4 sm:ml-6">
                          <a href="https://discord.gg/BWTSEkDT9W" rel="noopener noreferrer">
                            <FaDiscord className="mt-0.5 text-2xl" />
                          </a>
                        </div>
                        <div className="ml-4 sm:ml-6 w-8 h-8">
                          <a
                            href="https://bsky.app/profile/catalog.fyi"
                            className="w-full h-full"
                            rel="noopener noreferrer"
                          >
                            <FaBluesky className="mt-[5px] text-lg" />
                          </a>
                        </div>
                      </div>
                    </footer>
                  </div>

                  <Modals />

                  <Toast />
                </IntroTourProvider>
              </ModalsProvider>
            </UserBooksProvider>
          </UnreadsProvider>
        </UserProvider>
      </body>
    </html>
  )
}
