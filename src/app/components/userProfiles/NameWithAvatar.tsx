import Link from "next/link"
import { FaUserCircle } from "react-icons/fa"
import UserProfile from "lib/models/UserProfile"
import { getUserProfileLink } from "lib/helpers/general"

export default function NameWithAvatar({ userProfile, large = false }) {
  const { username, avatarUrl, name } = UserProfile.build(userProfile)

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
          <div className={`${large ? "mt-3 ml-3" : "text-sm"}`}>{name}</div>
        </div>
      </Link>
    </div>
  )
}
