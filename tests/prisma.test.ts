import { v4 as uuidv4 } from "uuid"
import prisma from "lib/prisma"

describe("testing jest-prisma", () => {
  let initialUserCount

  beforeAll(async () => {
    initialUserCount = await jestPrisma.originalClient.user.count()
  })

  test("Create a user", async () => {
    const createdUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: "test@test.com",
      },
    })

    expect(
      await prisma.user.findFirst({
        where: {
          email: "test@test.com",
        },
      }),
    ).toStrictEqual(createdUser)
  })

  test("num users has not changed", async () => {
    const currentUserCount = await prisma.user.count()
    expect(currentUserCount).toBe(initialUserCount)
  })
})
