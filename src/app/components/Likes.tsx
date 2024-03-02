"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import { Tooltip } from "react-tooltip"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import InteractionObjectType from "enums/InteractionObjectType"
import type Like from "types/Like"

export default function Likes({
  interactive,
  currentUserLike: _currentUserLike,
  likedObject,
  likedObjectType,
  likeCount: _likeCount,
  onChange,
  buttonId: _buttonId,
}: {
  interactive: boolean
  currentUserLike?: Like
  likedObject: any
  likedObjectType: string
  likeCount?: number
  onChange?: (likeCount?: number, currentUserLike?: Like) => void
  buttonId?: string
}) {
  const { setBookIdsToLiked } = useUserBooks()

  const [currentUserLike, setCurrentUserLike] = useState<Like | undefined>(_currentUserLike)
  const [likeCount, setLikeCount] = useState<number | undefined>(_likeCount)

  const likedByNames = likedObject.likedByNames || []
  const likedByNamesToShow = likedByNames.slice(0, 5)
  const likedByNamesRemaining = likedByNames.length - likedByNamesToShow.length

  const buttonId = _buttonId || `like-button-${likedObjectType}-${likedObject.id}`

  useEffect(() => {
    setCurrentUserLike(_currentUserLike)
  }, [_currentUserLike])

  useEffect(() => {
    setLikeCount(_likeCount)
  }, [_likeCount])

  async function toggleLike() {
    // optimistic updates
    try {
      if (currentUserLike) {
        const originalCurrentUserLike = currentUserLike
        const originalLikeCount = likeCount
        const newLikeCount = originalLikeCount ? originalLikeCount - 1 : undefined

        setCurrentUserLike(undefined)
        setLikeCount(newLikeCount)

        try {
          await api.likes.delete(currentUserLike.id)

          // update context state
          if (likedObjectType === InteractionObjectType.Book) {
            setBookIdsToLiked((prev) => {
              const next = { ...prev }
              delete next[likedObject.id]
              return next
            })
          }

          if (onChange) onChange(newLikeCount, undefined)
        } catch (error: any) {
          setCurrentUserLike(originalCurrentUserLike)
          setLikeCount(originalLikeCount)
          throw error
        }
      } else {
        const originalLikeCount = likeCount
        const newLikeCount =
          originalLikeCount || originalLikeCount === 0 ? originalLikeCount + 1 : undefined
        setCurrentUserLike({ id: "temp" } as Like)
        setLikeCount(newLikeCount)

        try {
          const createdLike = await api.likes.create({
            likedObject,
            likedObjectType,
          })

          setCurrentUserLike(createdLike)

          // update context state
          if (likedObjectType === InteractionObjectType.Book) {
            setBookIdsToLiked((prev) => ({
              ...prev,
              [likedObject.id]: true,
            }))
          }

          if (onChange) onChange(newLikeCount, createdLike)
        } catch (error: any) {
          setCurrentUserLike(undefined)
          setLikeCount(originalLikeCount)
          throw error
        }
      }
    } catch (error: any) {
      reportToSentry(error, {
        currentUserLike,
        likedObject,
        likedObjectType,
      })

      toast.error("Hmm, something went wrong.")
    }
  }

  return interactive ? (
    <div className="flex items-center">
      <button id={buttonId} onClick={toggleLike} className="flex items-center mr-1.5">
        {currentUserLike ? (
          <FaHeart className="mr-1.5 text-red-300 text-sm" />
        ) : (
          <FaRegHeart className="mr-1.5 text-gray-500 text-sm" />
        )}

        {(likeCount || likeCount === 0) && (
          <span className="text-sm text-gray-300 font-mulish">{likeCount}</span>
        )}
      </button>
      {likedByNames && likedByNames.length > 0 && (
        <Tooltip anchorSelect={`#${buttonId}`} className="text-sm font-mulish">
          {likedByNamesToShow.map((name) => (
            <div key={name}>{name}</div>
          ))}
          {likedByNamesRemaining > 0 && (
            <div>
              & {likedByNamesRemaining} other{likedByNamesRemaining > 1 ? "s" : ""}
            </div>
          )}
        </Tooltip>
      )}
    </div>
  ) : (
    <div className="flex items-center">
      <FaHeart className="mr-1.5 text-gray-500 text-sm" />
      {(likeCount || likeCount === 0) && (
        <span className="text-sm text-gray-300 font-mulish">{likeCount}</span>
      )}
    </div>
  )
}
