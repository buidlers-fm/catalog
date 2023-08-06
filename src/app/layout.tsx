import "./globals.css"
import { Chivo_Mono, Newsreader, Nunito_Sans } from "next/font/google"
import Search from "app/components/Search"
import type { Metadata } from "next"

const chivoMono = Chivo_Mono({ subsets: ["latin"], variable: "--font-chivo-mono" })
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
})
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" })

const fonts = [chivoMono, newsreader, nunitoSans]
const fontsClassNames = fonts.map((font) => font.variable).join(" ")

export const metadata: Metadata = {
  title: "catalog",
  description: "for book lovers.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontsClassNames} bg-black text-white`}>
        <div className="flex flex-col h-screen">
          <header className="px-8 py-8 flex justify-between">
            <div className="self-start text-5xl font-chivo-mono font-bold text-sand-500 tracking-wide">
              catalog.
            </div>
            <Search />
          </header>
          <main className="mx-24 mt-16 mb-auto font-newsreader font-normal text-md tracking-wide leading-relaxed">
            {children}
          </main>
          <footer className="mt-32 px-8 py-4 font-chivo-mono text-lg tracking-wider">
            © buidlers.
          </footer>
        </div>
      </body>
    </html>
  )
}
