"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu } from "@headlessui/react"
import { BsXLg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { useUser } from "lib/contexts/UserContext"
import SignInForm from "app/components/nav/SignInForm"
import SignUpForm from "app/components/nav/SignUpForm"
import "react-modern-drawer/dist/index.css"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function UserNav({ currentUserProfile }) {
  const router = useRouter()
  const { signOut } = useUser()
  const [showAuth, setShowAuth] = useState<boolean>(false)
  const [isSignIn, setIsSignIn] = useState<boolean>(true)

  const onClickSignIn = () => {
    setIsSignIn(true)
    setShowAuth(true)
  }

  const onClickSignOut = async () => {
    await signOut()
    setShowAuth(false)
    router.refresh()
  }

  return (
    <div>
      {currentUserProfile ? (
        <Menu>
          <Menu.Button className="cat-btn-text mt-2 lg:mt-0 ml-4 mr-2">
            <div className="flex">
              {currentUserProfile.avatarUrl ? (
                <div className="mr-3 w-[24px] h-[24px] overflow-hidden rounded-full">
                  <img
                    src={currentUserProfile.avatarUrl}
                    alt="user avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <FaUserCircle className="mr-3 text-2xl text-gold-100" />
              )}
              <span className="hidden sm:inline">{currentUserProfile.username}</span>
            </div>
          </Menu.Button>
          <div className="relative">
            <Menu.Items className="absolute top-2 w-[108px] bg-gray-900 rounded">
              <Menu.Item>
                <Link href={`/users/${currentUserProfile.username}`}>
                  <button className="w-full cat-btn-text hover:bg-gray-700 px-4 pt-3 pb-2 text-left rounded-tl rounded-tr">
                    Profile
                  </button>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <div className="">
                  <button
                    onClick={onClickSignOut}
                    className="w-full cat-btn-text hover:bg-gray-700 px-4 pt-2 pb-3 text-left rounded-bl rounded-br"
                  >
                    Sign out
                  </button>
                </div>
              </Menu.Item>
            </Menu.Items>
          </div>
        </Menu>
      ) : (
        <>
          <button onClick={onClickSignIn} className="cat-btn-text mt-2 lg:mt-0 ml-4 mr-2">
            Sign in
          </button>
          <Drawer
            open={showAuth}
            onClose={() => setShowAuth(false)}
            direction="right"
            style={{ backgroundColor: "hsl(26, 4%, 12%)", width: "320px" }}
          >
            <div className="p-8">
              <div className="flex">
                <div className="grow">
                  <h1 className="text-xl">{isSignIn ? "Sign in" : "Sign up"}</h1>
                </div>
                <button className="ml-8" onClick={() => setShowAuth(false)}>
                  <BsXLg className="text-xl text-gray-200" />
                </button>
              </div>
              <div>
                {isSignIn ? (
                  <SignInForm toggleAuth={() => setIsSignIn(false)} />
                ) : (
                  <SignUpForm toggleAuth={() => setIsSignIn(true)} />
                )}
              </div>
            </div>
          </Drawer>
        </>
      )}
    </div>
  )
}
