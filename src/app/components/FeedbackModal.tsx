"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import allValidations from "lib/constants/validations"
import FormTextarea from "app/components/forms/FormTextarea"

const feedbackValidations = allValidations.feedback

export default function FeedbackModal({ onClose, isOpen }) {
  const [text, setText] = useState<string>("")
  const [isBusy, setIsBusy] = useState<boolean>(false)

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
            <div className="cat-eyebrow-uppercase">Feedback</div>
            <div className="my-4 w-full sm:w-96 max-w-[384px]">
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

              <div className="">
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
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
