"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import FormRadioGroup from "app/components/forms/FormRadioGroup"
import Visibility, { visibilitySettingsCopy } from "enums/Visibility"

const options = {
  notesVisibility: [
    {
      value: Visibility.Public,
      label: visibilitySettingsCopy[Visibility.Public],
    },
    {
      value: Visibility.SignedIn,
      label: visibilitySettingsCopy[Visibility.SignedIn],
    },
    {
      value: Visibility.Friends,
      label: visibilitySettingsCopy[Visibility.Friends],
    },
    {
      value: Visibility.Self,
      label: visibilitySettingsCopy[Visibility.Self],
    },
  ],
}

export default function PrivacySettings({ currentUserProfile }) {
  const { notesVisibility: existingNotesVisibility } = currentUserProfile.config || {}

  const [notesVisibility, setNotesVisibility] = useState<Visibility>(
    existingNotesVisibility || Visibility.Public,
  )
  const [isBusy, setIsBusy] = useState<boolean>(false)

  function handleNotesVisibilityChange(selectedItem) {
    setNotesVisibility(selectedItem.value)
  }

  async function handleSubmit() {
    setIsBusy(true)

    const requestData = {
      notesVisibility,
    }

    const toastId = toast.loading("Updating privacy settings...")

    try {
      await api.userConfigs.update(requestData)

      toast.success("Privacy settings updated!", { id: toastId })
    } catch (error) {
      toast.error("Hmm, something went wrong.", { id: toastId })

      reportToSentry(error, {
        requestData,
        method: "PrivacySettings.handleSubmit",
      })
    }

    setIsBusy(false)
  }

  const defaultNotesVisibilityIndex = options.notesVisibility.findIndex(
    (item) => item.value === notesVisibility,
  )

  return (
    <div className="max-w-lg mx-8 sm:mx-auto font-mulish">
      <div className="cat-page-title">privacy and visibility settings</div>

      <div className="my-8">
        <div className="">
          <div className="my-2 cat-eyebrow-uppercase">book notes</div>
          <FormRadioGroup
            label="Make my book notes visible to:"
            helperText="Your choice will apply to all your notes, including existing ones."
            defaultItemIndex={defaultNotesVisibilityIndex}
            items={options.notesVisibility}
            onChange={handleNotesVisibilityChange}
          />
        </div>
      </div>

      <div className="">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy}
          className="cat-btn cat-btn-sm cat-btn-gold"
        >
          save settings
        </button>
      </div>
    </div>
  )
}
