import "app/globals.css"
import Link from "next/link"
import { Chivo_Mono, Newsreader, Mulish } from "next/font/google"
import { FaDiscord } from "react-icons/fa"
import { BsEnvelopeFill } from "react-icons/bs"
import { UserProvider } from "lib/contexts/UserContext"
import { NotificationsProvider } from "lib/contexts/NotificationsContext"
import CatalogHeader from "app/components/CatalogHeader"
import Toast from "app/components/Toast"
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
          <NotificationsProvider>
            <div className="flex flex-col h-screen">
              <CatalogHeader />
              <main className="mb-auto font-newsreader font-normal text-md tracking-wide leading-relaxed">
                {children}
              </main>
              <footer className="mt-32 px-6 xs:px-8 py-4 flex font-chivo-mono tracking-wider">
                ©&nbsp;
                <Link href="/">catalog</Link>.
                <div className="ml-4 xs:ml-6">
                  <Link href="/news" className="cat-btn-link text-sm">
                    news
                  </Link>
                </div>
                <div className="ml-4 xs:ml-6">
                  <Link href="/changelog" className="cat-btn-link text-sm">
                    changelog
                  </Link>
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
            <Toast />
          </NotificationsProvider>
        </UserProvider>
      </body>
    </html>
  )
}
