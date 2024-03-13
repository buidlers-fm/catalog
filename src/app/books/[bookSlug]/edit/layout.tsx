import Link from "next/link"
import { notFound } from "next/navigation"
import { TiWarningOutline } from "react-icons/ti"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getBookLink } from "lib/helpers/general"
import EditBookTabs from "app/books/[bookSlug]/edit/components/EditBookTabs"

export const dynamic = "force-dynamic"

export default async function EditBookLayout({ params, children }) {
  const { bookSlug } = params

  await getCurrentUserProfile({ requireSignedIn: true, redirectPath: `/books/${bookSlug}` })

  const book = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!book) notFound()

  return (
    <div className="my-8 mx-8 sm:mx-16 ml:max-w-3xl ml:mx-auto font-mulish">
      <div className="mt-8 mb-4 cat-page-title">
        edit{" "}
        <Link href={getBookLink(bookSlug)} className="underline">
          {book.title}
        </Link>{" "}
        by {book.authorName}
      </div>
      <div className="text-gray-300 text-sm">
        <TiWarningOutline className="inline-block -mt-1 mr-1 text-lg text-gold-500" />
        Make sure to save your changes before you switch tabs.
      </div>
      <div className="my-8 max-w-xl">
        <EditBookTabs book={book} />
      </div>
      {children}
    </div>
  )
}
