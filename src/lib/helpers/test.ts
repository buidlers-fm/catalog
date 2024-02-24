import { v4 as uuidv4 } from "uuid"
import prisma from "lib/prisma"

async function createRandomUser(prismaClient = prisma) {
  const user = await prismaClient.user.create({
    data: {
      id: uuidv4(),
      email: `${uuidv4()}@test.com`,
    },
  })

  const userProfile = await prismaClient.userProfile.create({
    data: {
      username: uuidv4(),
      userId: user.id,
    },
  })

  return userProfile
}

async function deleteUser(userId: string, prismaClient = prisma) {
  await prismaClient.userProfile.deleteMany({
    where: {
      userId,
    },
  })

  await prismaClient.user.deleteMany({
    where: {
      id: userId,
    },
  })
}

export { createRandomUser, deleteUser }
