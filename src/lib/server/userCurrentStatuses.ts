import prisma from "lib/prisma"
import Visibility from "enums/Visibility"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"

async function isCurrentStatusVisible(userProfile, currentUserProfile) {
  if (currentUserProfile && userProfile.id === currentUserProfile.id) return true

  let userConfig = userProfile.config

  if (!userConfig) {
    userConfig = await prisma.userConfig.findFirst({
      where: {
        userProfileId: userProfile.id,
      },
    })
  }

  const { currentStatusVisibility } = userConfig

  if (currentStatusVisibility === Visibility.Public) return true

  if (currentStatusVisibility === Visibility.SignedIn && currentUserProfile) {
    return true
  }

  if (currentStatusVisibility === Visibility.Friends && currentUserProfile) {
    const userFollowsCurrentUser = !!(await prisma.interaction.findFirst({
      where: {
        interactionType: InteractionType.Follow,
        agentId: userProfile.id,
        objectId: currentUserProfile.id,
        objectType: InteractionObjectType.User,
      },
    }))

    return userFollowsCurrentUser
  }

  return false
}

export { isCurrentStatusVisible }
