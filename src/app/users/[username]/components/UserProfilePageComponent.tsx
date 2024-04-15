"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useTour } from "@reactour/tour"
import { useModals } from "lib/contexts/ModalsContext"
import UserProfile from "lib/models/UserProfile"
import { getLocalStorage, deleteLocalStorage } from "lib/localstorage"
import {
  INTRO_TOUR_LOCALSTORAGE_KEY,
  INTRO_TOUR_PROFILE_PAGE_STEP,
} from "app/components/IntroTourProvider"
import { getUserListsLink, getNewListLink } from "lib/helpers/general"
import ProfileCurrentStatus from "app/users/[username]/components/ProfileCurrentStatus"
import ProfileBookNotes from "app/users/[username]/bookNotes/components/ProfileBookNotes"
import ListBook from "app/lists/components/ListBook"
import ListCard from "app/components/lists/ListCard"
import EmptyState from "app/components/EmptyState"

export default function UserProfilePageComponent({
  userProfile,
  currentUserProfile,
  lists,
  favoriteBooksList,
  hasPinnedLists,
  showCurrentStatus,
}) {
  const { setCurrentStep, setIsOpen } = useTour()
  const { currentModal, setCurrentModal } = useModals()

  useEffect(() => {
    const currentTourStep = getLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY)
    if (currentTourStep === INTRO_TOUR_PROFILE_PAGE_STEP) {
      setCurrentStep(currentTourStep)
      setIsOpen(true)
      deleteLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY)
      setCurrentModal(undefined)
    }
  }, [setCurrentStep, setIsOpen, currentModal, setCurrentModal])

  const isUsersProfile = currentUserProfile?.id === userProfile.id

  const { name } = UserProfile.build(userProfile)

  return (
    <div className="mt-4 flex flex-col lg:flex-row justify-center">
      {showCurrentStatus && (
        <div className="lg:w-64 mt-4 lg:mr-16 font-mulish">
          <ProfileCurrentStatus
            userProfile={userProfile}
            // @ts-ignore
            userCurrentStatus={userProfile.currentStatuses[0]}
            isUsersProfile={isUsersProfile}
          />
        </div>
      )}
      <div className="xs:w-[400px] sm:w-[600px] lg:w-[640px] mt-8 lg:mt-4">
        <div className="font-mulish">
          <div className="cat-eyebrow">favorite books</div>
          <hr className="my-1 h-[1px] border-none bg-gray-300" />
          {favoriteBooksList?.books && favoriteBooksList.books.length > 0 ? (
            <div className="p-0 grid grid-cols-4 sm:gap-[28px]">
              {favoriteBooksList.books.map((book) => (
                <ListBook key={book!.id} book={book} isFavorite />
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-center font-newsreader italic text-lg text-gray-300">
              {isUsersProfile
                ? "Edit your profile to add your favorite books."
                : `${name} hasn't added any favorite books yet.`}
            </div>
          )}
        </div>

        <ProfileBookNotes userProfile={userProfile} currentUserProfile={currentUserProfile} />

        <div className="mt-16 font-mulish">
          <div className="flex justify-between text-gray-300 text-sm">
            <div className="cat-eyebrow">{hasPinnedLists ? "pinned lists" : "recent lists"}</div>
            <div
              className={`flex flex-col xs:flex-row items-end xs:items-stretch ${
                isUsersProfile ? "-mt-10 xs:-mt-3" : ""
              }`}
            >
              {isUsersProfile && (
                <Link href={getNewListLink(currentUserProfile)}>
                  <button
                    data-intro-tour="create-list"
                    className="cat-btn cat-btn-sm cat-btn-gray mx-2 mb-1 xs:mb-0"
                  >
                    + create a list
                  </button>
                </Link>
              )}
              <Link
                className={`inline-block ${isUsersProfile ? "my-1 xs:mb-0" : ""} mx-2`}
                href={getUserListsLink(userProfile.username)}
              >
                {isUsersProfile ? "manage / more" : "more"}
              </Link>
            </div>
          </div>
          <hr className="my-1 h-[1px] border-none bg-gray-300" />
          {lists.length > 0 ? (
            <div className="">
              {lists.map((list) => (
                <ListCard key={list.id} list={list} currentUserProfile={currentUserProfile} />
              ))}
            </div>
          ) : (
            <EmptyState
              text={
                isUsersProfile
                  ? "Create lists to group books by a common theme, either for yourself or to share with friends."
                  : `${name} hasn't created any lists yet.`
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
