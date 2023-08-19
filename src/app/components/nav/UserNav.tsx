"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Menu } from "@headlessui/react"
import { BsXLg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { useUser } from "contexts/UserContext"
import SignInForm from "app/components/nav/SignInForm"
import SignUpForm from "app/components/nav/SignUpForm"
import "react-modern-drawer/dist/index.css"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

export default function UserNav() {
  const { currentUser, signOut } = useUser()
  const [showAuth, setShowAuth] = useState<boolean>(false)
  const [isSignIn, setIsSignIn] = useState<boolean>(true)

  const onClickSignIn = () => {
    setIsSignIn(true)
    setShowAuth(true)
  }

  return (
    <div>
      {currentUser ? (
        <Menu>
          <Menu.Button className="cat-btn-text mt-2 lg:mt-0 ml-4 mr-2">
            <div className="flex">
              <FaUserCircle className=" mr-3 text-2xl text-sand-500" />
              <span className="hidden sm:inline">{currentUser.username}</span>
            </div>
          </Menu.Button>
          <div className="relative">
            <Menu.Items className="absolute top-2 w-[92px] bg-gray-900 rounded px-4 py-3">
              <Menu.Item>
                <button onClick={signOut} className="cat-btn-text">
                  Sign out
                </button>
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
