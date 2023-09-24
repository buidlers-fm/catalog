import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import slugify from "slug"
import cryptoRandomString from "crypto-random-string"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import type { NextRequest } from "next/server"
import type Book from "types/Book"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const prisma = new PrismaClient()

const generateUniqueSlug = async (str, modelName, additionalFilters = {}) => {
  const simpleSlug = slugify(str)
  const simpleSlugFilters = { slug: simpleSlug, ...additionalFilters }
  const isSimpleSlugAvailable = !(await (prisma[modelName] as any).findFirst({
    where: simpleSlugFilters,
  }))

  if (isSimpleSlugAvailable) return simpleSlug

  let slug
  let isSlugTaken = true

  /* eslint-disable no-await-in-loop */
  while (isSlugTaken) {
    const randomString = cryptoRandomString({ length: 6 })
    slug = `${simpleSlug}-${randomString}`
    const filters = { slug, ...additionalFilters }
    isSlugTaken = !!(await (prisma[modelName] as any).findFirst({ where: filters }))
  }

  return slug
}

export async function POST(req: NextRequest) {
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
        `Selected ${selectedBooks.length} books for list but only ${selectedBookRecords.length} books found in db`,
      )
    }

    // create list + list item assignments as a transaction
    const listSlug = await generateUniqueSlug(listTitle, "list", { ownerId: userProfile.id })

    const listItemAssignments = selectedBookRecords.map((book, idx) => ({
      listedObjectType: "book",
      listedObjectId: book.id,
      sortOrder: idx + 1,
    }))

    const createdList = await prisma.list.create({
      data: {
        slug: listSlug,
        title: listTitle,
        description: listDescription,
        creatorId: userProfile.id,
        ownerId: userProfile.id,
        listItemAssignments: {
          createMany: {
            data: listItemAssignments,
          },
        },
      },
    })

    const resBody = humps.decamelizeKeys(createdList)

    return NextResponse.json(resBody, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
