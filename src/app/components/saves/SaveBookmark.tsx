"use client"

import { useState } from "react"
import { Tooltip } from "react-tooltip"
import toast from "react-hot-toast"
import { FaBookmark, FaRegBookmark } from "react-icons/fa"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import InteractionObjectType from "enums/InteractionObjectType"

interface SaveProps {
  savedObjectType: InteractionObjectType
  savedObjectId: string
  saveId?: string
}

const SaveBookmark = ({ savedObjectType, savedObjectId, saveId: _saveId }: SaveProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [saveId, setSaveId] = useState(_saveId)

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const savedObjectResp = await api.saves.create({
        savedObjectId,
        savedObjectType,
      })

      setSaveId(savedObjectResp.id)

      toast.success(`Saved ${savedObjectType}!`)
    } catch (error: any) {
      reportToSentry(error, {
        savedObjectId,
        savedObjectType,
        saveId,
      })

      toast.error("Hmm, something went wrong.")
    }

    setIsLoading(false)
  }

  const handleUnsave = async () => {
    setIsLoading(true)

    try {
      await api.saves.delete(saveId)

      setSaveId(undefined)

      toast.success(`Unsaved ${savedObjectType}!`)
    } catch (error: any) {
      reportToSentry(error, {
        savedObjectId,
        savedObjectType,
        saveId,
      })

      toast.error("Hmm, something went wrong.")
    }

    setIsLoading(false)
  }

  const tooltipAnchorSelectId = `save-bookmark-${savedObjectId}`

  // small trick to make it appear that saving/deleting is immediate. if we save and set isLoading
  // to true, then immediately fill in the bookmark and later update isLoading to false and set the
  // saveId. if we unsave and set isLoading to true, then immediately clear the bookmark and later
  // update isLoading to false and set saveId to undefined.
  //
  // saveId    | isLoading | appearsSaved | bookmark outcome
  // ---------------------------------------------------------------
  // present   | false     | true         | filled-in, enabled
  // undefined | false     | false        | empty, enabled
  // present   | true      | false        | empty, disabled
  // undefined | true      | true         | filled-in, disabled
  const appearsSaved = !saveId !== !isLoading

  if (isLoading) {
    return (
      <div className="flex">
        <FaBookmark className="text-gray-500 text-sm animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <Tooltip anchorSelect={`#${tooltipAnchorSelectId}`} className="max-w-[240px] font-mulish">
        <div className="text-center">
          {appearsSaved ? "unsave" : "save"} this {savedObjectType}
        </div>
      </Tooltip>

      {appearsSaved ? (
        <button onClick={handleUnsave} className="flex">
          <FaBookmark id={tooltipAnchorSelectId} className="text-gold-500 text-sm" />
        </button>
      ) : (
        <button onClick={handleSave} className="flex">
          <FaRegBookmark id={tooltipAnchorSelectId} className="text-gray-500 text-sm" />
        </button>
      )}
    </>
  )
}

export default SaveBookmark
