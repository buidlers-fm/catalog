"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Menu } from "@headlessui/react"
import { BsXLg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { RxCaretDown } from "react-icons/rx"
import { useUser } from "lib/contexts/UserContext"
import { useUnreads } from "lib/contexts/UnreadsContext"
import { useModals } from "lib/contexts/ModalsContext"
import {
  getUserProfileLink,
  getUserShelvesLink,
  getUserListsLink,
  getUserFollowingLink,
} from "lib/helpers/general"
import SignInForm from "app/components/nav/SignInForm"
import SignUpForm from "app/components/nav/SignUpForm"
import ForgotPassword from "app/components/nav/ForgotPassword"
import FeedbackModal from "app/components/FeedbackModal"
import AuthForm from "enums/AuthForm"
import CurrentModal from "enums/CurrentModal"
import "react-modern-drawer/dist/index.css"

const Drawer = dynamic(() => import("react-modern-drawer"), { ssr: false })

const authFormTitles = {
  [AuthForm.SignIn]: "sign in",
  [AuthForm.SignUp]: "sign up",
  [AuthForm.ForgotPassword]: "forgot password",
}

export default function UserNav({ currentUserProfile: _initialCurrentUserProfile }) {
  const { signOut } = useUser()
  const { hasUnreadNotifs, hasUnreadRecs } = useUnreads()
  const { setCurrentModal } = useModals()

  const [currentUserProfile, setCurrentUserProfile] = useState(_initialCurrentUserProfile)
  const [showAuth, setShowAuth] = useState<boolean>(false)
  const [currentAuthForm, setCurrentAuthForm] = useState<AuthForm>(AuthForm.SignIn)
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false)

  useEffect(() => {
    setCurrentUserProfile(_initialCurrentUserProfile)
  }, [_initialCurrentUserProfile])

  function onClickSignIn() {
    setCurrentAuthForm(AuthForm.SignIn)
    setShowAuth(true)
  }

  async function onClickSignOut() {
    await signOut()
    setShowAuth(false)
    window.location.reload()
  }

  function handleAuthSuccess(_currentUserProfile) {
    setCurrentUserProfile(_currentUserProfile)
    setShowAuth(false)
  }

  const { username } = currentUserProfile || {}

  const userLinks = [
    { name: "inbox", path: "/inbox" },
    { name: "profile", path: getUserProfileLink(username) },
    { name: "shelves", path: getUserShelvesLink(username) },
    { name: "lists", path: getUserListsLink(username) },
    { name: "friends", path: getUserFollowingLink(username) },
    { name: "saved", path: "/saved" },
  ]

  return (
    <>
      <div>
        {currentUserProfile ? (
          <Menu>
            <Menu.Button className="cat-btn-text mt-2 lg:mt-0 ml-4 mr-2">
              <div className="flex items-center">
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
                <RxCaretDown className="inline-block mt-1 ml-0.5 text-2xl text-gray-300" />
              </div>
            </Menu.Button>
            <div className="relative mr-1">
              <Menu.Items className="absolute top-2 right-0 w-[150px] bg-gray-900 rounded z-10">
                <Menu.Item>
                  <Link href="/home">
                    <button className="w-full cat-btn-text hover:bg-gray-700 px-4 pt-3 pb-2 text-left rounded-tl rounded-tr">
                      home
                    </button>
                  </Link>
                </Menu.Item>
                {userLinks.map(({ name, path }) => (
                  <Menu.Item key={name}>
                    <Link href={path}>
                      <button className="w-full cat-btn-text hover:bg-gray-700 px-4 pt-2 pb-2 text-left">
                        {name === "inbox" ? (
                          <div className="relative">
                            <span>inbox</span>
                            {(hasUnreadNotifs || hasUnreadRecs) && (
                              <span className="w-1.5 h-1.5 absolute top-1.5 right-6 rounded-full bg-gold-200" />
                            )}
                          </div>
                        ) : (
                          name
                        )}
                      </button>
                    </Link>
                  </Menu.Item>
                ))}
                <hr className="my-1 w-3/4 mx-auto border-gray-700" />
                <Menu.Item>
                  <div className="">
                    <Link href={`/users/${currentUserProfile.username}/year/2024`}>
                      <button className="w-full cat-btn-text hover:bg-gray-700 !text-gold-500 px-4 py-2 text-left rounded-tl rounded-tr">
                        2024 in books
                      </button>
                    </Link>
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div className="">
                    <Link href="/explore">
                      <button className="w-full cat-btn-text hover:bg-gray-700 px-4 py-2 text-left rounded-tl rounded-tr">
                        explore
                      </button>
                    </Link>
                  </div>
                </Menu.Item>
                {/* below assumes FeatureFlag.GeneralInvites enabled! */}
                <Menu.Item>
                  <div className="">
                    <button
                      onClick={() => setCurrentModal(CurrentModal.Invites)}
                      className="w-full hover:bg-gray-700 px-4 py-2 text-left rounded-tl rounded-tr"
                    >
                      invite
                    </button>
                  </div>
                </Menu.Item>
                <hr className="my-1 w-3/4 mx-auto border-gray-700" />
                <Menu.Item>
                  <div className="">
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="w-full cat-btn-text hover:bg-gray-700 px-4 py-2 text-left rounded-bl rounded-br"
                    >
                      help
                    </button>
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div className="">
                    <Link href="/settings">
                      <button className="w-full cat-btn-text hover:bg-gray-700 px-4 py-2 text-left rounded-tl rounded-tr">
                        settings
                      </button>
                    </Link>
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div className="">
                    <button
                      onClick={onClickSignOut}
                      className="w-full cat-btn-text hover:bg-gray-700 px-4 pt-2 pb-3 text-left rounded-bl rounded-br"
                    >
                      sign out
                    </button>
                  </div>
                </Menu.Item>
              </Menu.Items>
            </div>
          </Menu>
        ) : (
          <>
            <div className="mt-2 lg:-mt-2 flex justify-end items-center">
              <Link href="/explore" className="mr-2 text-gray-100">
                explore
              </Link>
              <button onClick={onClickSignIn} className="cat-btn-text ml-2">
                sign in
              </button>
            </div>
            <Drawer
              open={showAuth}
              onClose={() => setShowAuth(false)}
              direction="right"
              style={{ backgroundColor: "hsl(26, 4%, 12%)", width: "320px" }}
            >
              <div className="p-8 font-mulish">
                <div className="flex">
                  <div className="grow">
                    <h1 className="text-xl">{authFormTitles[currentAuthForm]}</h1>
                  </div>
                  <button className="ml-8" onClick={() => setShowAuth(false)}>
                    <BsXLg className="text-xl text-gray-200" />
                  </button>
                </div>
                <div>
                  {currentAuthForm === AuthForm.SignIn && (
                    <SignInForm
                      onSuccess={handleAuthSuccess}
                      toggleAuth={(value) => setCurrentAuthForm(value)}
                    />
                  )}
                  {currentAuthForm === AuthForm.SignUp && (
                    <SignUpForm
                      onSuccess={handleAuthSuccess}
                      toggleAuth={() => setCurrentAuthForm(AuthForm.SignIn)}
                    />
                  )}
                  {currentAuthForm === AuthForm.ForgotPassword && <ForgotPassword />}
                </div>
              </div>
            </Drawer>
          </>
        )}
      </div>

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} isOpen={showFeedbackModal} />
      )}
    </>
  )
}
