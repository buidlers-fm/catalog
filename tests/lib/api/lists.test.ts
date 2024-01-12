import prisma from "lib/prisma"
import { setUpCurrentUserProfile, tearDownCurrentUserProfile } from "lib/helpers/test"
import { createList } from "lib/api/lists"

describe("createList", () => {
  const listBaseParams = {
    title: "my list",
    description: "description",
    books: [],
    slug: "my-list",
    ranked: false,
    designation: undefined,
    bookNotes: [],
  }

  // openLibraryWorkId is being used as a proxy for "the original order of the books"
  // to simplify the ordering checks
  const books = [
    {
      title: "Book 1",
      authorName: "Author 1",
      openLibraryWorkId: "1",
    },
    {
      title: "Book 2",
      authorName: "Author 2",
      openLibraryWorkId: "2",
    },
    {
      title: "Book 3",
      authorName: "Author 3",
      openLibraryWorkId: "3",
    },
  ]

  let currentUserProfile
  beforeAll(async () => {
    currentUserProfile = await setUpCurrentUserProfile(jestPrisma.originalClient)
  })

  afterAll(async () => {
    await tearDownCurrentUserProfile(jestPrisma.originalClient)
  })

  describe("list with no books", () => {
    const listParams = listBaseParams

    test("it creates a list with the expected values", async () => {
      const listCountBefore = await prisma.list.count()
      expect(listCountBefore).toBe(0)

      await createList(listParams, currentUserProfile)

      const createdList = await prisma.list.findFirst({
        include: {
          listItemAssignments: true,
        },
      })

      expect(createdList).toBeTruthy()

      expect(createdList?.title).toBe(listParams.title)
      expect(createdList?.description).toBe(listParams.description)
      expect(createdList?.slug).toBe(listParams.slug)
      expect(createdList?.ranked).toBe(listParams.ranked)
      expect(createdList?.designation).toBe(null)
      expect(createdList?.creatorId).toBe(currentUserProfile.id)
      expect(createdList?.ownerId).toBe(currentUserProfile.id)
      expect(createdList?.listItemAssignments.length).toBe(0)
    })

    test("it returns a list with the expected values", async () => {
      const createdList = await createList(listParams, currentUserProfile)

      expect(createdList.title).toBe(listParams.title)
      expect(createdList.description).toBe(listParams.description)
      expect(createdList.slug).toBe(listParams.slug)
      expect(createdList.ranked).toBe(listParams.ranked)
      expect(createdList.designation).toBe(null)
      expect(createdList.creatorId).toBe(currentUserProfile.id)
      expect(createdList.ownerId).toBe(currentUserProfile.id)
    })
  })

  describe("list with all nonexistent books", () => {
    const listParams = {
      ...listBaseParams,
      books,
    }

    test("it creates all the books", async () => {
      const bookCountBefore = await prisma.book.count()
      expect(bookCountBefore).toBe(0)

      await createList(listParams, currentUserProfile)

      const createdBooks = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      expect(createdBooks.length).toBe(books.length)

      createdBooks.forEach((book, index) => {
        expect(book.title).toBe(books[index].title)
        expect(book.authorName).toBe(books[index].authorName)
        expect(book.openLibraryWorkId).toBe(books[index].openLibraryWorkId)
        expect(typeof book.id).toBe("string")
        expect(typeof book.slug).toBe("string")
      })
    })

    test("it creates list item assignments with the expected values", async () => {
      const returnedList = await createList(listParams, currentUserProfile)

      const createdList = await prisma.list.findFirst({
        where: {
          id: returnedList.id,
        },
        include: {
          listItemAssignments: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      })

      expect(createdList).toBeTruthy()

      expect(createdList?.listItemAssignments.length).toBe(books.length)

      const createdBooks = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      createdList?.listItemAssignments.forEach((listItemAssignment, index) => {
        expect(listItemAssignment.listedObjectType).toBe("book")
        expect(listItemAssignment.listedObjectId).toBe(createdBooks[index].id)
        expect(listItemAssignment.sortOrder).toBe(index + 1)
      })
    })
  })

  describe("list with all existing books", () => {
    const listParams = {
      ...listBaseParams,
      books,
    }

    beforeEach(async () => {
      await prisma.book.createMany({
        data: books.map((book) => ({
          ...book,
          slug: book.title.split(" ").join("-"),
        })),
      })
    })

    test("it creates no new books", async () => {
      const existingBooksBefore = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      expect(existingBooksBefore.length).toBe(books.length)

      await createList(listParams, currentUserProfile)

      const existingBooksAfter = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      expect(existingBooksAfter.length).toBe(existingBooksBefore.length)

      existingBooksAfter.forEach((book, index) => {
        expect(book.id).toBe(existingBooksBefore[index].id)
      })
    })

    test("it creates list item assignments with the expected values", async () => {
      const returnedList = await createList(listParams, currentUserProfile)

      const createdList = await prisma.list.findFirst({
        where: {
          id: returnedList.id,
        },
        include: {
          listItemAssignments: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      })

      expect(createdList).toBeTruthy()

      expect(createdList?.listItemAssignments.length).toBe(books.length)

      const existingBooks = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      createdList?.listItemAssignments.forEach((listItemAssignment, index) => {
        expect(listItemAssignment.listedObjectType).toBe("book")
        expect(listItemAssignment.listedObjectId).toBe(existingBooks[index].id)
        expect(listItemAssignment.sortOrder).toBe(index + 1)
      })
    })
  })

  describe("list with a mix of existing and nonexistent books", () => {
    const listParams = {
      ...listBaseParams,
      books,
    }

    const NUM_EXISTING_BOOKS = 2

    beforeEach(async () => {
      await prisma.book.createMany({
        data: books.slice(0, NUM_EXISTING_BOOKS).map((book) => ({
          ...book,
          slug: book.title.split(" ").join("-"),
        })),
      })
    })

    test("it creates only the new books", async () => {
      const existingBooksBefore = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      expect(existingBooksBefore.length).toBe(NUM_EXISTING_BOOKS)

      await createList(listParams, currentUserProfile)

      const existingBooksAfter = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      expect(existingBooksAfter.length).toBe(books.length)

      // check that the first two books are the same and haven't
      // been recreated
      existingBooksAfter.slice(0, NUM_EXISTING_BOOKS).forEach((book, index) => {
        expect(book.id).toBe(existingBooksBefore[index].id)
      })
    })

    test("it creates list item assignments with the expected values", async () => {
      const returnedList = await createList(listParams, currentUserProfile)

      const createdList = await prisma.list.findFirst({
        where: {
          id: returnedList.id,
        },
        include: {
          listItemAssignments: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      })

      expect(createdList).toBeTruthy()

      expect(createdList?.listItemAssignments.length).toBe(books.length)

      const existingBooks = await prisma.book.findMany({
        orderBy: {
          openLibraryWorkId: "asc",
        },
      })

      createdList?.listItemAssignments.forEach((listItemAssignment, index) => {
        expect(listItemAssignment.listedObjectType).toBe("book")
        expect(listItemAssignment.listedObjectId).toBe(existingBooks[index].id)
        expect(listItemAssignment.sortOrder).toBe(index + 1)
      })
    })
  })

  describe("when book notes are provided", () => {
    const notes = [
      {
        openLibraryWorkId: "1",
        note: "one",
      },
      {
        openLibraryWorkId: "2",
        note: "two",
      },
      {
        openLibraryWorkId: "3",
        note: "three",
      },
    ]

    describe("and book notes are in the same order as books", () => {
      const listParams = {
        ...listBaseParams,
        books,
        bookNotes: notes,
      }

      test("list item assignments have the correct notes", async () => {
        const returnedList = await createList(listParams, currentUserProfile)

        const createdList = await prisma.list.findFirst({
          where: {
            id: returnedList.id,
          },
          include: {
            listItemAssignments: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        })

        expect(createdList).toBeTruthy()

        expect(createdList?.listItemAssignments.length).toBe(books.length)

        createdList?.listItemAssignments.forEach((listItemAssignment, index) => {
          expect(listItemAssignment.note).toBe(notes[index].note)
          expect(listItemAssignment.sortOrder).toBe(index + 1)
        })
      })
    })

    describe("and book notes are out of order", () => {
      const listParams = {
        ...listBaseParams,
        books,
        bookNotes: [...notes].reverse(),
      }

      test("list item assignments have the correct notes (notes order doesn't matter)", async () => {
        const returnedList = await createList(listParams, currentUserProfile)

        const createdList = await prisma.list.findFirst({
          where: {
            id: returnedList.id,
          },
          include: {
            listItemAssignments: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        })

        expect(createdList).toBeTruthy()

        expect(createdList?.listItemAssignments.length).toBe(books.length)

        createdList?.listItemAssignments.forEach((listItemAssignment, index) => {
          expect(listItemAssignment.note).toBe(notes[index].note)
          expect(listItemAssignment.sortOrder).toBe(index + 1)
        })
      })
    })
  })
})
