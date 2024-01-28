"use client"

import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { FaBookmark, FaRegBookmark } from "react-icons/fa"
import api from "lib/api"

interface SaveProps {
  interactive?: boolean
  savedObjectType: string
  savedObjectId: string
  saveId?: string
}

const SaveBookmark = ({
  interactive = true,
  savedObjectType,
  savedObjectId,
  saveId: _saveId,
}: SaveProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [saveId, setSaveId] = useState(_saveId)

  const handleSave = async () => {
    setIsLoading(true)
    const savedObjectResp = await api.saves.create({
      savedObjectId,
      savedObjectType,
    })
    setSaveId(savedObjectResp.id)
    setIsLoading(false)
  }

  const handleUnsave = async () => {
    setIsLoading(true)
    await api.saves.delete(saveId)
    setSaveId(undefined)
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

  return interactive ? (
    <>
      {!isLoading && (
        <Tooltip anchorSelect={`#${tooltipAnchorSelectId}`} className="max-w-[240px] font-mulish">
          <div className="text-center">
            {appearsSaved ? "Unsave" : "Save"} this {savedObjectType}
          </div>
        </Tooltip>
      )}

      {appearsSaved ? (
        <button onClick={handleUnsave} className="flex" disabled={isLoading}>
          <FaBookmark id={tooltipAnchorSelectId} className="text-gold-500 text-sm" />
        </button>
      ) : (
        <button onClick={handleSave} className="flex" disabled={isLoading}>
          <FaRegBookmark id={tooltipAnchorSelectId} className="text-gray-500 text-sm" />
        </button>
      )}
    </>
  ) : saveId ? (
    <FaBookmark className="text-gold-500 text-sm" />
  ) : (
    <FaRegBookmark className="text-gray-500 text-sm" />
  )
}

export default SaveBookmark
