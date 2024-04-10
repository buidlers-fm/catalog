import prisma from "lib/prisma"
import { decorateWithFollowing, decorateWithLikes } from "lib/server/decorators"
import { idsToObjects } from "lib/helpers/general"
import UserCurrentStatusCard from "app/components/userCurrentStatuses/UserCurrentStatusCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import Visibility from "enums/Visibility"

const LIMIT = 5

export default async function FriendsCurrentStatuses({ currentUserProfile }) {
  const twoWeeksAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)

  const followingQueryOptions = {
    include: {
      currentStatuses: {
        where: {
          createdAt: {
            gte: twoWeeksAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          book: true,
        },
      },
      config: true,
    },
  }

  const [decoratedUserProfile] = await decorateWithFollowing(
    [currentUserProfile],
    followingQueryOptions,
  )

  const { following } = decoratedUserProfile

  const allFriendToCurrentUserFollows = await prisma.interaction.findMany({
    where: {
      agentId: {
        in: following.map(({ id }) => id),
      },
      interactionType: InteractionType.Follow,
      objectId: currentUserProfile.id,
      objectType: InteractionObjectType.User,
    },
  })

  const followingWithCurrentStatuses = following
    // filter for visibility and presence
    .filter((friend) => {
      if (friend.currentStatuses.length === 0) return false

      const {
        config: { currentStatusVisibility },
      } = friend

      if (
        currentStatusVisibility === Visibility.Public ||
        currentStatusVisibility === Visibility.SignedIn
      ) {
        return true
      }

      // visibility is Friends
      const friendFollowsCurrentUser = allFriendToCurrentUserFollows.some(
        (follow) => follow.agentId === friend.id,
      )

      return friendFollowsCurrentUser
    })
    // sort by most recent status
    .sort(
      (a, b) =>
        new Date(b.currentStatuses[0].createdAt).valueOf() -
        new Date(a.currentStatuses[0].createdAt).valueOf(),
    )
    .slice(0, LIMIT)

  // decorate current statuses with likes
  const decoratedCurrentStatuses = await decorateWithLikes(
    followingWithCurrentStatuses.map(
      (followedUserProfile) => followedUserProfile.currentStatuses[0],
    ),
    InteractionObjectType.UserCurrentStatus,
    currentUserProfile,
  )

  const followingWithCurrentStatusesMap = idsToObjects(followingWithCurrentStatuses)

  decoratedCurrentStatuses.forEach((currentStatus) => {
    followingWithCurrentStatusesMap[currentStatus.userProfileId].currentStatuses = [currentStatus]
  })

  return (
    <div className="mt-4 max-w-xl mx-auto font-mulish">
      <div className="cat-eyebrow">friends' recent statuses</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      <div className="max-w-lg mx-auto">
        {following ? (
          following.length > 0 ? (
            followingWithCurrentStatuses.length > 0 ? (
              <div className="">
                {followingWithCurrentStatuses.map((followedUserProfile) => (
                  <UserCurrentStatusCard
                    key={followedUserProfile.id}
                    userProfile={followedUserProfile}
                    userCurrentStatus={followedUserProfile.currentStatuses[0]}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="None of your friends has set a status recently." small />
            )
          ) : (
            <EmptyState text="You're not following anyone yet." small />
          )
        ) : (
          <LoadingSection small />
        )}
      </div>
    </div>
  )
}
