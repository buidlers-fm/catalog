"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { useTour } from "@reactour/tour"
import { Dialog } from "@headlessui/react"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import { useUser } from "lib/contexts/UserContext"
import api from "lib/api"
import {
  INTRO_TOUR_LOCALSTORAGE_KEY,
  INTRO_TOUR_PROFILE_PAGE_STEP,
} from "app/components/IntroTourProvider"
import { setLocalStorage } from "lib/localstorage"
import { getUserProfileLink } from "lib/helpers/general"
import { reportToSentry } from "lib/sentry"
import allValidations from "lib/constants/validations"
import FormTextarea from "app/components/forms/FormTextarea"

const feedbackValidations = allValidations.feedback

export default function FeedbackModal({ onClose, isOpen }) {
  const pathname = usePathname()
  const { setCurrentStep, setIsOpen } = useTour()
  const { currentUserProfile } = useUser()

  const [text, setText] = useState<string>("")
  const [isBusy, setIsBusy] = useState<boolean>(false)

  async function handleStartTour() {
    // if already on profile page, start tour. otherwise, navigate to profile page
    const profilePagePath = getUserProfileLink(currentUserProfile!.username)
    if (profilePagePath === pathname) {
      setCurrentStep(INTRO_TOUR_PROFILE_PAGE_STEP)
      setIsOpen(true)
      await onClose()
    } else {
      setLocalStorage(INTRO_TOUR_LOCALSTORAGE_KEY, INTRO_TOUR_PROFILE_PAGE_STEP)
      window.location.href = profilePagePath
    }
  }

  const submit = async () => {
    if (text && text.length > feedbackValidations.text.maxLength) {
      return
    }

    setIsBusy(true)

    const toastId = toast.loading("Submitting feedback...")

    const requestData = {
      text,
    }

    try {
      await api.feedbackSubmissions.create(requestData)

      toast.success(`Feedback submitted!`, { id: toastId })

      await onClose()
    } catch (error: any) {
      reportToSentry(error, requestData)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  const readyToSubmit = !!text && text.length <= feedbackValidations.text.maxLength

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90vh] overflow-y-auto max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-900 px-16 py-8">
          <button onClick={onClose} className="absolute top-[24px] right-[24px]">
            <BsXLg className="text-xl" />
          </button>

          <div className="mt-8 md:mt-0 md:ml-8">
            <div className="my-4 w-full sm:w-96 max-w-[384px]">
              <div className="cat-eyebrow-uppercase">help</div>
              <div className="mt-2 mb-2">
                <button className="cat-link" onClick={handleStartTour}>
                  Take a tour
                </button>{" "}
                of some of the features in catalog.
              </div>

              <div className="mt-2 mb-8">
                Or check the{" "}
                <a href="/guide" className="underline" target="_blank">
                  guide
                </a>{" "}
                to see if your question is answered there.
              </div>

              <div className="cat-eyebrow-uppercase -mb-2">Feedback</div>
              <FormTextarea
                labelText="Bugs, issues, suggestions, things you particularly like, feature requests, etc? Let us know!"
                name="text"
                type="text"
                rows={5}
                atMentionsEnabled={false}
                remainingChars={feedbackValidations.text.maxLength - (text?.length || 0)}
                fullWidth
                bgColor="bg-gray-800"
                moreClasses="mt-1"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={submit}
                  className="mt-4 cat-btn cat-btn-sm cat-btn-gold"
                  disabled={isBusy || !readyToSubmit}
                >
                  save
                </button>
              </div>

              <div className="mt-4 cat-eyebrow-uppercase">contact</div>
              <div className="mt-2">
                Need a response from us? Contact us via{" "}
                <a
                  href="mailto:staff@catalog.fyi"
                  className="cat-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  email
                </a>{" "}
                or{" "}
                <a
                  href="https://discord.gg/c9F4suZyAf"
                  className="cat-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>{" "}
                instead.
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
