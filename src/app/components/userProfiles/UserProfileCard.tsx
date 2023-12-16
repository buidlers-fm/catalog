import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import FollowButton from "app/components/userProfiles/FollowButton"

export default function UserProfileCard({ userProfile, currentUserProfile }) {
  const isSignedIn = !!currentUserProfile
  const isCurrentUser = currentUserProfile?.id === userProfile.id

  return (
    <div className="flex justify-between px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <NameWithAvatar key={userProfile.id} userProfile={userProfile} large />
      {isSignedIn && !isCurrentUser && (
        <div className="py-4">
          <FollowButton userProfile={userProfile} currentUserProfile={currentUserProfile} />
        </div>
      )}
    </div>
  )
}
