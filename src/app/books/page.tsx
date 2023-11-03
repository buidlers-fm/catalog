import { cookies } from "next/headers"
import humps from "humps"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import OpenLibrary from "lib/openlibrary"
import BookPage from "app/books/components/BookPage"
import type Book from "types/Book"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export default async function BookPageByQuery({ searchParams }) {
  const { openlibraryWorkId } = searchParams

  if (!openlibraryWorkId) throw new Error("openlibraryWorkId must be included")

  const openlibraryBook: Book = await OpenLibrary.getFullBook(openlibraryWorkId)

  // get user profile (in order to get user lists)
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  const { session } = humps.camelizeKeys(data)
  const sessionUserId = session?.user?.id

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      userId: sessionUserId,
    },
  })

  if (!userProfile) throw new Error("User not found")

  const userLists = await prisma.list.findMany({
    where: {
      ownerId: userProfile.id,
      designation: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  })

  const allBookIds = userLists
    .map((list) =>
      list.listItemAssignments
        .filter((lia) => lia.listedObjectType === "book")
        .map((lia) => lia.listedObjectId),
    )
    .flat()

  const allBooks = await prisma.book.findMany({
    where: {
      id: {
        in: allBookIds,
      },
    },
  })

  userLists.forEach((list: any) => {
    list.books = list.listItemAssignments
      .map((lia) => {
        if (lia.listedObjectType !== "book") return null

        return allBooks.find((b) => b.id === lia.listedObjectId)
      })
      .filter((b) => !!b)
  })

  console.log(userLists)

  return <BookPage book={openlibraryBook} userLists={userLists} />
}
