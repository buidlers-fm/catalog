import { decorateWithFollowing } from "lib/server/decorators"
import UserCurrentStatusCard from "app/components/userCurrentStatuses/UserCurrentStatusCard"

export default async function FriendsCurrentStatuses({ currentUserProfile }) {
  const followingQueryOptions = {
    include: {
      currentStatuses: {
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
      <div className="cat-eyebrow">friends' current statuses</div>
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
              <div className="h-24 flex items-center justify-center font-newsreader italic text-gray-300">
                None of your friends have a current status right now.
              </div>
            )
          ) : (
            <div className="h-24 flex items-center justify-center font-newsreader italic text-gray-300">
              You're not following anyone yet.
            </div>
          )
        ) : (
          <div className="h-24 flex items-center justify-center font-newsreader italic text-gray-300">
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}