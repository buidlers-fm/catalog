import { testApiHandler } from "next-test-api-route-handler"
import * as booksApi from "app/api/books/route"
import prisma from "lib/prisma"

describe("GET /api/books", () => {
  it("returns a 400 if no id passed", async () => {
    const url = `ntarh://api/books`

    await testApiHandler({
      appHandler: booksApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(400)
        const { error } = await res.json()
        expect(error).toMatch(/open_library_work_id is required/)
      },
    })
  })

  it("returns a 404 if not found", async () => {
    const nonexistentOpenLibraryWorkId = "foo"
    const url = `ntarh://api/books/?open_library_work_id=${nonexistentOpenLibraryWorkId}`

    await testApiHandler({
      appHandler: booksApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(404)
      },
    })
  })

  it("returns a book if found", async () => {
    const bookData = {
      openLibraryWorkId: "OL12345W",
      slug: "enders-game",
      title: "Ender's Game",
    }

    const book = await prisma.book.create({ data: bookData })

    const url = `ntarh://api/books/?open_library_work_id=${book.openLibraryWorkId}`

    await testApiHandler({
      appHandler: booksApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        const foundBook = await res.json()

        expect(foundBook).toBeTruthy()
        expect(foundBook.title).toBe(book.title)
        expect(foundBook.slug).toBe(book.slug)
      },
    })
  })

  it("uses case-insensitive lookup", async () => {
    const bookData = {
      openLibraryWorkId: "OL12345W",
      slug: "enders-game",
      title: "Ender's Game",
    }

    const book = await prisma.book.create({ data: bookData })

    const url = `ntarh://api/books/?open_library_work_id=${book.openLibraryWorkId?.toLowerCase()}`

    await testApiHandler({
      appHandler: booksApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        const foundBook = await res.json()

        expect(foundBook).toBeTruthy()
        expect(foundBook.title).toBe(book.title)
        expect(foundBook.slug).toBe(book.slug)
      },
    })
  })
})
