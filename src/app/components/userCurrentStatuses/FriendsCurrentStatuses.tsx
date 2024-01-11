import { decorateWithFollowing } from "lib/server/decorators"
import UserCurrentStatusCard from "app/components/userCurrentStatuses/UserCurrentStatusCard"
import EmptyState from "app/components/EmptyState"
import LoadingSection from "app/components/LoadingSection"

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
    },
  }

  const [decoratedUserProfile] = await decorateWithFollowing(
    [currentUserProfile],
    followingQueryOptions,
  )

  const { following } = decoratedUserProfile
  const followingWithCurrentStatuses = following
    .filter((followedUserProfile) => followedUserProfile.currentStatuses.length > 0)
    .sort(
      (a, b) =>
        new Date(b.currentStatuses[0].createdAt).valueOf() -
        new Date(a.currentStatuses[0].createdAt).valueOf(),
    )

  return (
    <div className="mt-4 max-w-lg mx-auto font-mulish">
      <div className="cat-eyebrow">friends' recent statuses</div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      <div>
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
              <EmptyState text="None of your friends has set a current status recently." small />
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
