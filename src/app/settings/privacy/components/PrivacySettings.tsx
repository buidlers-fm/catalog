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
  shelvesVisibility: [
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
  currentStatusVisibility: [
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
  ],
}

export default function PrivacySettings({ currentUserProfile }) {
  const {
    notesVisibility: existingNotesVisibility,
    shelvesVisibility: existingShelvesVisibility,
    currentStatusVisibility: existingCurrentStatusVisibility,
  } = currentUserProfile.config || {}

  const [notesVisibility, setNotesVisibility] = useState<Visibility>(
    existingNotesVisibility || Visibility.Public,
  )
  const [shelvesVisibility, setShelvesVisibility] = useState<Visibility>(
    existingShelvesVisibility || Visibility.Public,
  )
  const [currentStatusVisibility, setCurrentStatusVisibility] = useState<Visibility>(
    existingCurrentStatusVisibility || Visibility.Public,
  )
  const [isBusy, setIsBusy] = useState<boolean>(false)

  async function handleSubmit() {
    setIsBusy(true)

    const requestData = {
      notesVisibility,
      shelvesVisibility,
      currentStatusVisibility,
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

  const defaultShelvesVisibilityIndex = options.shelvesVisibility.findIndex(
    (item) => item.value === shelvesVisibility,
  )

  const defaultCurrentStatusVisibilityIndex = options.currentStatusVisibility.findIndex(
    (item) => item.value === currentStatusVisibility,
  )

  const NotesVisibilityLabel = (
    <div>
      Who can see my <span className="text-gold-500">book notes</span>:
    </div>
  )

  const ShelvesVisibilityLabel = (
    <div>
      Who can see my <span className="text-gold-500">shelves</span>:
    </div>
  )

  const CurrentStatusVisibilityLabel = (
    <div>
      Who can see my <span className="text-gold-500">current status</span>:
    </div>
  )

  return (
    <div className="max-w-lg mx-8 sm:mx-auto font-mulish">
      <div className="cat-page-title">privacy and visibility settings</div>

      <div className="my-8">
        <div className="my-2">
          <FormRadioGroup
            label={NotesVisibilityLabel}
            helperText="Your choice will apply to all your notes, including existing ones."
            defaultItemIndex={defaultNotesVisibilityIndex}
            items={options.notesVisibility}
            onChange={(selectedItem) => setNotesVisibility(selectedItem.value as Visibility)}
          />
        </div>

        <div className="my-8">
          <FormRadioGroup
            label={ShelvesVisibilityLabel}
            helperText="Your shelves will still be included in any anonymized aggregate shelf stats that are shown."
            defaultItemIndex={defaultShelvesVisibilityIndex}
            items={options.shelvesVisibility}
            onChange={(selectedItem) => setShelvesVisibility(selectedItem.value as Visibility)}
          />
        </div>

        <div className="my-8">
          <FormRadioGroup
            label={CurrentStatusVisibilityLabel}
            helperText={`This refers to the current status you set for your profile (you can find this on your profile page or by going to "home").`}
            defaultItemIndex={defaultCurrentStatusVisibilityIndex}
            items={options.currentStatusVisibility}
            onChange={(selectedItem) =>
              setCurrentStatusVisibility(selectedItem.value as Visibility)
            }
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
