import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "stacks",
  description: "for book lovers.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="px-8 py-8">
          <div className="text-5xl">stacks.</div>
        </div>
        <div>{children}</div>
      </body>
    </html>
  )
}
