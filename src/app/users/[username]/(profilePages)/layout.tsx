import Link from "next/link"
import { notFound } from "next/navigation"
import { UserProfile as UserProfilePrisma } from "@prisma/client"
import { BsLink45Deg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { PiMapPinFill } from "react-icons/pi"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import FollowButton from "app/components/userProfiles/FollowButton"
import UserProfileTabs from "app/users/[username]/components/UserProfileTabs"
import CustomMarkdown from "app/components/CustomMarkdown"
import { getDomainFromUrl } from "lib/helpers/general"
import { decorateWithFollowers } from "lib/server/decorators"
import UserProfile from "lib/models/UserProfile"

export const dynamic = "force-dynamic"

export default async function UserProfileLayout({ params, children }) {
  const { username } = params
  const currentUserProfile = await getCurrentUserProfile()

  const prismaUserProfile: UserProfilePrisma | null = await prisma.userProfile.findFirst({
    where: {
      username,
    },
    include: {
      bookNotes: {
        where: {
          text: {
            not: null,
            notIn: [""],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          creator: true,
          book: true,
        },
      },
      currentStatuses: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          book: true,
        },
      },
    },
  })

  if (!prismaUserProfile) notFound()

  const [decoratedUserProfile] = await decorateWithFollowers([prismaUserProfile])
  const userProfile = UserProfile.build(decoratedUserProfile)

  const isUsersProfile = currentUserProfile?.id === userProfile.id
  const isSignedIn = !!currentUserProfile

  const { name, bio, location, website, avatarUrl } = userProfile

  return (
    <div className="mt-4 xs:w-[400px] sm:w-[600px] lg:w-[960px] mx-8 xs:mx-auto">
      <div className="sm:flex font-mulish">
        {avatarUrl ? (
          <div className="shrink-0 sm:mr-3 w-24 h-24 overflow-hidden rounded-full">
            <img src={avatarUrl} alt="user avatar" className="object-cover min-w-full min-h-full" />
          </div>
        ) : (
          <FaUserCircle className="mr-3 text-[96px] text-gray-500" />
        )}
        <div className="my-6 sm:my-0 sm:ml-4 grow">
          <div className="text-2xl font-bold">{name}</div>
          <div className="mt-2 max-w-lg">
            <CustomMarkdown markdown={bio} />
          </div>
          <div className="flex mt-3 text-gray-300">
            {location && (
              <div className="mr-4">
                <PiMapPinFill className="inline-block -mt-[5px] mr-1" />
                {location}
              </div>
            )}
            {website && (
              <div>
                <BsLink45Deg className="inline-block -mt-[3px] mr-1 text-lg " />
                <Link href={website} target="_blank" rel="noopener noreferrer">
                  {getDomainFromUrl(website)}
                </Link>
              </div>
            )}
          </div>
        </div>
        <div>
          {isUsersProfile ? (
            <Link href="/settings/profile">
              <button className="cat-btn cat-btn-sm cat-btn-gray">edit profile</button>
            </Link>
          ) : (
            isSignedIn && (
              <FollowButton
                userProfile={decoratedUserProfile}
                currentUserProfile={currentUserProfile}
              />
            )
          )}
        </div>
      </div>
      <div className="mt-12 mb-8">
        <UserProfileTabs userProfile={decoratedUserProfile} />
      </div>
      <div>{children}</div>
    </div>
  )
}
