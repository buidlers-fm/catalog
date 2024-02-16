import { v4 as uuidv4 } from "uuid"
import prisma from "lib/prisma"

const USER_EMAIL = "test@test.com"

describe("testing jest-prisma", () => {
  test("create a user", async () => {
    const createdUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: USER_EMAIL,
      },
    })

    expect(
      await prisma.user.findFirst({
        where: {
          email: USER_EMAIL,
        },
      }),
    ).toStrictEqual(createdUser)
  })

  test("user created in other test does not exist", async () => {
    const user = await prisma.user.findFirst({
      where: {
        email: USER_EMAIL,
      },
    })
    expect(user).toBeNull()
  })
})
