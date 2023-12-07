import Link from "next/link"
import { FaUserCircle } from "react-icons/fa"
import UserProfile from "lib/models/UserProfile"
import { getUserProfileLink } from "lib/helpers/general"

export default function NameWithAvatar({ userProfile }) {
  const { username, avatarUrl, name } = UserProfile.build(userProfile)

  return (
    <div className="my-2">
      <Link href={getUserProfileLink(username)}>
        <div className="flex">
          {avatarUrl ? (
            <img src={avatarUrl} alt="user avatar" className="mr-2 w-[20px] rounded-full" />
          ) : (
            <FaUserCircle className="mr-2 text-xl text-gold-100" />
          )}
          <span className="text-sm">{name}</span>
        </div>
      </Link>
    </div>
  )
}
