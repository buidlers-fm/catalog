import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { generateUniqueSlug } from "lib/helpers/general"
import type { NextRequest } from "next/server"
import type Book from "types/Book"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }) {
  try {
    // auth check
    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
    )
    const { data, error: supabaseError } = await supabase.auth.getSession()
    if (supabaseError) throw supabaseError

    const { session } = humps.camelizeKeys(data)
    if (!session) throw new Error("No session found")

    // fetch profile id
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    if (!userProfile) throw new Error("User profile not found")

    // verify list exists and belongs to current user
    const { listId } = params
    const list = await prisma.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        listItemAssignments: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    })

    if (!list) return NextResponse.json({}, { status: 404 })
    if (list.ownerId !== userProfile.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this list" },
        { status: 403 },
      )
    }

    const {
      title: listTitle,
      description: listDescription,
      books: selectedBooks,
    } = humps.camelizeKeys(await req.json())

    // find existing books
    const existingBooks = await prisma.book.findMany({
      where: { openlibraryWorkId: { in: selectedBooks.map((b) => b.openlibraryWorkId) } },
    })

    // create books that don't exist
    const existingBookOpenlibraryWorkIds = existingBooks.map((b) => b.openlibraryWorkId)
    const selectedBooksToCreate: Book[] = selectedBooks.filter(
      (b) => !existingBookOpenlibraryWorkIds.includes(b.openlibraryWorkId),
    )

    const booksToCreatePromises = selectedBooksToCreate.map(async (selectedBook) => {
      const { title, by, coverImageUrl, openlibraryWorkId } = selectedBook

      return {
        slug: await generateUniqueSlug(`${title} ${by}`, "book"),
        title,
        authorName: by,
        coverImageUrl,
        openlibraryWorkId,
      }
    })

    const booksToCreate = await Promise.all(booksToCreatePromises)

    await prisma.book.createMany({
      data: booksToCreate,
    })

    const selectedBookRecords = await prisma.book.findMany({
      where: { openlibraryWorkId: { in: selectedBooks.map((b) => b.openlibraryWorkId) } },
    })

    if (selectedBookRecords.length !== selectedBooks.length) {
      throw new Error(
        `Selected ${selectedBooks.length} books for list but ${selectedBookRecords.length} books found in db`,
      )
    }

    // regenerate slug if title has changed
    let listSlug = list.slug
    if (listTitle !== list.title) {
      listSlug = await generateUniqueSlug(listTitle, "list", { ownerId: userProfile.id })
    }

    // update list
    const updatedList = await prisma.list.update({
      where: {
        id: listId,
      },
      data: {
        slug: listSlug,
        title: listTitle,
        description: listDescription,
      },
    })

    // delete + recreate list item assignments
    await prisma.listItemAssignment.deleteMany({
      where: {
        listId,
      },
    })

    const orderedSelectedBookRecords = selectedBookRecords.sort((a, b) => {
      const indexOfA = selectedBooks.findIndex(
        (book) => book.openlibraryWorkId === a.openlibraryWorkId,
      )
      const indexOfB = selectedBooks.findIndex(
        (book) => book.openlibraryWorkId === b.openlibraryWorkId,
      )

      if (indexOfA === -1 || indexOfB === -1)
        throw new Error("fetched a book record that wasn't selected for the list")

      return indexOfA - indexOfB
    })

    const listItemAssignments = orderedSelectedBookRecords.map((book, idx) => ({
      listId,
      listedObjectType: "book",
      listedObjectId: book.id,
      sortOrder: idx + 1,
    }))

    await prisma.listItemAssignment.createMany({
      data: listItemAssignments,
    })

    const resBody = humps.decamelizeKeys(updatedList)

    return NextResponse.json(resBody, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
