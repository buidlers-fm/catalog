"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import api from "lib/api"
import type Like from "types/Like"

export default function Likes({
  interactive,
  currentUserLike: _currentUserLike,
  likedObject,
  likedObjectType,
  likeCount: _likeCount,
  onChange,
  buttonId,
}: {
  interactive: boolean
  currentUserLike?: Like
  likedObject: any
  likedObjectType: string
  likeCount?: number
  onChange?: (likeCount?: number, currentUserLike?: Like) => void
  buttonId?: string
}) {
  const [currentUserLike, setCurrentUserLike] = useState<Like | undefined>(_currentUserLike)
  const [likeCount, setLikeCount] = useState<number | undefined>(_likeCount)

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
          if (onChange) onChange(newLikeCount, createdLike)
        } catch (error: any) {
          setCurrentUserLike(undefined)
          setLikeCount(originalLikeCount)
          throw error
        }
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Hmm, something went wrong.")
    }
  }

  return (
    <div className="flex">
      {interactive ? (
        <button id={buttonId} onClick={toggleLike} className="inline-block mr-1.5">
          {currentUserLike ? (
            <FaHeart className="text-red-300 text-sm" />
          ) : (
            <FaRegHeart className="text-gray-500 text-sm" />
          )}
        </button>
      ) : (
        <FaHeart className="inline-block mt-1 mr-1.5 text-gray-500 text-sm" />
      )}
      {(likeCount || likeCount === 0) && (
        <span className="inline-block mt-0.5 text-sm text-gray-300">{likeCount}</span>
      )}
    </div>
  )
}
