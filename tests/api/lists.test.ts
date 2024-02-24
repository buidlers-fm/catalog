import { testApiHandler } from "next-test-api-route-handler"
import { v4 as uuid } from "uuid"
import humps from "humps"
import prisma from "lib/prisma"
import { createRandomUser, deleteUser } from "lib/helpers/test"
import { createList } from "lib/api/lists"

let currentUserProfileMockValue
jest.mock("../../src/lib/server/auth", () => ({
  getCurrentUserProfile: jest.fn(() => currentUserProfileMockValue),
}))

const listBaseParams = {
  title: "my list",
  slug: "my-list",
}

const books = [
  {
    title: "Book 1",
    slug: "book-1",
    openLibraryWorkId: "OL1W",
  },
  {
    title: "Book 2",
    slug: "book-2",
    openLibraryWorkId: "OL2W",
  },
  {
    title: "Book 3",
    slug: "book-3",
    openLibraryWorkId: "OL3W",
  },
]

describe("GET /api/lists, authed", () => {
  let listsApi
  let currentUserProfile

  beforeAll(async () => {
    currentUserProfile = await createRandomUser(jestPrisma.originalClient)

    currentUserProfileMockValue = currentUserProfile

    listsApi = await import("app/api/lists/route")
  })

  afterAll(async () => {
    await deleteUser(currentUserProfile.userId, jestPrisma.originalClient)
  })

  it("returns a 400 if no ids passed", async () => {
    const url = `cat://api/lists?limit=100`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(400)
        const { error } = await res.json()
        expect(error).toMatch(/book_id or user_profile_id is required/)
      },
    })
  })

  it("returns a 400 if invalid user profile id passed", async () => {
    const invalidId = "foo"
    const url = `cat://lists/?user_profile_id=${invalidId}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(400)
        const { error } = await res.json()
        expect(error).toMatch(/not a valid UUID/)
      },
    })
  })

  it("returns a 400 if invalid book id passed", async () => {
    const invalidId = "foo"
    const url = `cat://lists/?book_id=${invalidId}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(400)
        const { error } = await res.json()
        expect(error).toMatch(/not a valid UUID/)
      },
    })
  })

  it("returns an empty array if no matching lists found for user profile", async () => {
    await prisma.list.create({
      data: {
        ...listBaseParams,
        ownerId: currentUserProfile.id,
        creatorId: currentUserProfile.id,
      },
    })

    const nonexistentId = uuid()
    const url = `cat://lists/?user_profile_id=${nonexistentId}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(200)

        const lists = await res.json()
        expect(lists).toEqual([])
      },
    })
  })

  it("returns an empty array if no matching lists found for book", async () => {
    await prisma.list.create({
      data: {
        ...listBaseParams,
        ownerId: currentUserProfile.id,
        creatorId: currentUserProfile.id,
      },
    })

    const nonexistentBookId = uuid()
    const url = `cat://lists/?book_id=${nonexistentBookId}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(200)

        const lists = await res.json()
        expect(lists).toEqual([])
      },
    })
  })

  it("returns matching lists for user profile id", async () => {
    const otherUserProfile = await createRandomUser()

    await prisma.list.createMany({
      data: [
        {
          ...listBaseParams,
          ownerId: currentUserProfile.id,
          creatorId: currentUserProfile.id,
        },
        {
          ...listBaseParams,
          ownerId: otherUserProfile.id,
          creatorId: otherUserProfile.id,
        },
      ],
    })

    const url = `cat://lists/?user_profile_id=${currentUserProfile.id}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(200)

        const lists = humps.camelizeKeys(await res.json())
        expect(lists.length).toEqual(1)
        expect(lists[0].creatorId).toEqual(currentUserProfile.id)
      },
    })
  })

  it("returns matching lists for book id", async () => {
    await createList(
      {
        title: "My List",
        books,
      },
      currentUserProfile,
    )

    // an empty list
    await createList(
      {
        title: "My Other List",
        books: [],
      },
      currentUserProfile,
    )

    const book = await prisma.book.findFirst({
      where: {
        openLibraryWorkId: books[0].openLibraryWorkId,
      },
    })

    expect(book).toBeTruthy()

    const url = `cat://lists/?book_id=${book!.id}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(200)

        const lists = humps.camelizeKeys(await res.json())
        expect(lists.length).toEqual(1)

        const [list] = lists
        expect(list.creatorId).toEqual(currentUserProfile.id)
        expect(list.books.length).toEqual(books.length)
        expect(list.books[0].id).toEqual(book!.id)
      },
    })
  })
})

describe("GET /api/lists, unauthed", () => {
  let listsApi

  beforeAll(async () => {
    currentUserProfileMockValue = undefined

    listsApi = await import("app/api/lists/route")
  })

  it("returns matching lists for user profile id", async () => {
    const userProfile = await createRandomUser()
    const otherUserProfile = await createRandomUser()

    await prisma.list.createMany({
      data: [
        {
          ...listBaseParams,
          ownerId: userProfile.id,
          creatorId: userProfile.id,
        },
        {
          ...listBaseParams,
          ownerId: otherUserProfile.id,
          creatorId: otherUserProfile.id,
        },
      ],
    })

    const url = `cat://lists/?user_profile_id=${userProfile.id}`

    await testApiHandler({
      appHandler: listsApi as any,
      url,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
        })

        expect(res.status).toBe(200)

        const lists = humps.camelizeKeys(await res.json())
        expect(lists.length).toEqual(1)
        expect(lists[0].creatorId).toEqual(userProfile.id)
      },
    })
  })
})
