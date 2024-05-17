"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { useTour } from "@reactour/tour"
import { Dialog } from "@headlessui/react"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { setLocalStorage } from "lib/localstorage"
import { getUserProfileLink } from "lib/helpers/general"
import {
  INTRO_TOUR_LOCALSTORAGE_KEY,
  INTRO_TOUR_PROFILE_PAGE_STEP,
} from "app/components/IntroTourProvider"

export default function IntroTourPreTourModal({ currentUserProfile, onClose, isOpen }) {
  const pathname = usePathname()
  const { setCurrentStep, setIsOpen } = useTour()

  const [acceptedTour, setAcceptedTour] = useState(false)
  const [declinedTour, setDeclinedTour] = useState(false)

  async function updateUserConfig() {
    const requestData = {
      seenIntroTour: true,
    }

    try {
      await api.userConfigs.update(requestData)
    } catch (error: any) {
      reportToSentry(error, {
        currentUserProfile,
        requestData,
        method: "IntroTourPreTourModal.updateUserConfig",
      })
    }
  }

  async function handleClose() {
    updateUserConfig()
    await onClose()
  }

  async function handleAccept() {
    const profilePagePath = getUserProfileLink(currentUserProfile.username)
    if (profilePagePath === pathname) {
      setCurrentStep(INTRO_TOUR_PROFILE_PAGE_STEP)
      setIsOpen(true)
      await onClose()
    } else {
      setAcceptedTour(true)
      setLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY, INTRO_TOUR_PROFILE_PAGE_STEP)
      window.location.href = profilePagePath
    }
    updateUserConfig()
  }

  async function handleDecline() {
    setDeclinedTour(true)
    updateUserConfig()
  }

  const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  const isNewUser = currentUserProfile && new Date(currentUserProfile.createdAt) > oneWeekAgo

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded bg-gray-900 px-12 py-8 font-mulish">
          {!declinedTour && (
            <Dialog.Title>
              <div className="mb-4 text-center text-xl font-bold">
                {acceptedTour ? "Starting the tour..." : "Welcome to catalog!"}
              </div>
            </Dialog.Title>
          )}

          {acceptedTour ? (
            <div />
          ) : declinedTour ? (
            <>
              <div className="my-8">
                Sure thing. If you change your mind, you can start the tour by going to the main
                menu (at the top right) and clicking "help".
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="block mx-auto cat-btn-normal-case cat-btn-md cat-btn-gold"
                >
                  OK
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="my-8">
                Hey stranger,{" "}
                {isNewUser
                  ? "I see you're new here. Would you like a quick tour of the app?"
                  : "I see you've been around for a little while, but would you like a quick tour of the app?"}
              </div>

              <div className="my-8">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="cat-btn-normal-case cat-btn-md cat-btn-gold mb-4 text-left"
                >
                  Yes, start the tour!
                </button>
                <button type="button" onClick={handleDecline} className="mt-2 cat-link">
                  No thanks, I'll just look around for now
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
