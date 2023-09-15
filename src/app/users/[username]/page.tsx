import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { BsLink45Deg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { PiMapPinFill } from "react-icons/pi"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

const getDomainFromUrl = (url: string) => new URL(url).hostname

export default async function UserProfilePage({ params }) {
  const { username } = params

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      username,
    },
  })

  console.log("profile page fetch:")
  console.log(userProfile)

  const { displayName, bio, location, website, avatarUrl } = userProfile!

  // const bio =
  //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at nibh elit. Aliquam quis erat non velit imperdiet pretium vel eget velit. Sed sed tempus velit. Donec interdum sit amet augue ut cursus. Nunc nulla neque, finibus id volutpat eget, egestas vel tellus. Nam ultricies placerat lectus dui."

  return (
    <div className="mt-4 max-w-4xl mx-auto">
      <div className="flex font-nunito-sans">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-24 w-24 bg-cover bg-no-repeat bg-center rounded-full"
          />
        ) : (
          <FaUserCircle className=" mr-3 text-[96px] text-gray-500" />
        )}
        <div className="ml-4 grow">
          <div className="text-2xl font-bold">{displayName || username}</div>
          <div className="mt-2 max-w-lg whitespace-pre-wrap">{bio}</div>
          <div className="flex mt-3 text-gray-300">
            {location && (
              <div>
                <PiMapPinFill className="inline-block -mt-[5px] mr-1" />
                {location}
              </div>
            )}
            {website && (
              <div className="ml-4">
                <BsLink45Deg className="inline-block -mt-[3px] mr-1 text-lg " />
                <Link href={website} target="_blank" rel="noopener noreferrer">
                  {getDomainFromUrl(website)}
                </Link>
              </div>
            )}
          </div>
        </div>
        <div>
          <Link href="/settings/profile">
            <button className="cat-btn cat-btn-gray">Edit Profile</button>
          </Link>
        </div>
      </div>
      <div className="mt-12 font-nunito-sans">
        <div className="text-gray-300 text-sm uppercase tracking-wider">Favorite Books</div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
          Nothin to see here.
        </div>
      </div>
      <div className="mt-8 font-nunito-sans">
        <div className="text-gray-300 text-sm uppercase tracking-wider">Lists</div>
        <hr className="my-1 h-[1px] border-none bg-gray-300" />
        <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
          Nothin to see here.
        </div>
      </div>
    </div>
  )
}
