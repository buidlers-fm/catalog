import { v4 as uuidv4 } from "uuid"
import prisma from "lib/prisma"

const CURRENT_USER_EMAIL = "current_user@test.com"
const CURRENT_USER_USERNAME = "current_user"

async function setUpCurrentUserProfile(prismaClient = prisma) {
  let user = await prismaClient.user.findFirst({
    where: {
      email: CURRENT_USER_EMAIL,
    },
  })

  if (!user) {
    user = await prismaClient.user.create({
      data: {
        id: uuidv4(),
        email: CURRENT_USER_EMAIL,
      },
    })
  }

  let userProfile = await prismaClient.userProfile.findFirst({
    where: {
      userId: user.id,
    },
  })

  if (userProfile) return userProfile

  userProfile = await prismaClient.userProfile.create({
    data: {
      username: CURRENT_USER_USERNAME,
      userId: user.id,
    },
  })

  return userProfile
}

async function tearDownCurrentUserProfile(prismaClient = prisma) {
  await prismaClient.userProfile.deleteMany({
    where: {
      username: CURRENT_USER_USERNAME,
    },
  })

  await prismaClient.user.deleteMany({
    where: {
      email: CURRENT_USER_EMAIL,
    },
  })
}

export { setUpCurrentUserProfile, tearDownCurrentUserProfile }
