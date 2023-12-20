import "app/globals.css"
import Link from "next/link"
import { Chivo_Mono, Newsreader, Mulish } from "next/font/google"
import { UserProvider } from "lib/contexts/UserContext"
import { getCurrentUserProfile } from "lib/server/auth"
import Nav from "app/components/nav/Nav"
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
  const currentUserProfile = await getCurrentUserProfile()

  return (
    <html lang="en">
      <body className={`${fontsClassNames} bg-black text-white`}>
        <UserProvider>
          <div className="flex flex-col h-screen">
            <header className="px-8 py-8 flex justify-between">
              <div className="self-start text-3xl sm:text-4xl font-chivo-mono font-bold text-gold-500 tracking-wide">
                <Link href="/">catalog</Link>
              </div>
              <Nav currentUserProfile={currentUserProfile} />
            </header>
            <main className="mb-auto font-newsreader font-normal text-md tracking-wide leading-relaxed">
              {children}
            </main>
            <footer className="mt-32 px-8 py-4 font-chivo-mono tracking-wider">© catalog.</footer>
          </div>
          <Toast />
        </UserProvider>
      </body>
    </html>
  )
}
