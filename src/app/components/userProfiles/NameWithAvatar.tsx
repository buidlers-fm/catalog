import Link from "next/link"
import { FaUserCircle } from "react-icons/fa"
import UserProfile from "lib/models/UserProfile"
import { getUserProfileLink } from "lib/helpers/general"

export default function NameWithAvatar({ userProfile, large = false, bothNames = false }) {
  const { username, displayName, avatarUrl, name } = UserProfile.build(userProfile)

  return (
    <div className="my-2">
      <Link href={getUserProfileLink(username)}>
        <div className="flex">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="user avatar"
              className={`mr-2 ${large ? "w-[48px] h-[48px]" : "w-[20px] h-[20px]"} rounded-full`}
            />
          ) : (
            <FaUserCircle className={`mr-2 ${large ? "text-5xl" : "text-xl"} text-gold-100`} />
          )}
          {bothNames ? (
            displayName ? (
              <div className={`${large ? "ml-3" : "-mt-1 text-sm"}`}>
                <div>{displayName}</div>
                <div className="text-gray-300 text-sm">@{username}</div>
              </div>
            ) : (
              <div className={`${large ? "mt-3 ml-3" : "text-sm"}`}>
                <div>@{username}</div>
              </div>
            )
          ) : (
            <div className={`${large ? "mt-3 ml-3" : "text-sm"}`}>{name}</div>
          )}
        </div>
      </Link>
    </div>
  )
}
