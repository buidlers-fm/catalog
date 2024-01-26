"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function AdminWaitlist({ waitlisters: _waitlisters, currentUserProfile }) {
  const [waitlisters, setWaitlisters] = useState<any[]>(_waitlisters || [])
  const [errorMessage, setErrorMessage] = useState<string>()

  async function markAsInvited(waitlisterId: string) {
    try {
      await api.waitlisters.markAsInvited(waitlisterId)

      // update object
      const updatedWaitlisters = waitlisters.map((waitlister) => {
        if (waitlister.id === waitlisterId) {
          return {
            ...waitlister,
            invitedAt: new Date().toJSON(),
            invitedByUserProfileId: currentUserProfile.id,
            invitedByUserProfile: currentUserProfile,
          }
        }

        return waitlister
      })

      setWaitlisters(updatedWaitlisters)
    } catch (error: any) {
      reportToSentry(error)
      setErrorMessage(error.message)
      toast.error("Hmm, something went wrong.")
    }
  }

  return (
    <div className="my-8 max-w-md mx-auto font-mulish">
      {errorMessage && <div className="my-2 text-red-300">{errorMessage}</div>}
      <div className="my-8 text-sm">
        <table className="border-separate rounded bg-gray-800">
          <thead>
            <tr>
              <th className="bg-gray-800 p-2 rounded-tl">name</th>
              <th className="bg-gray-800 p-2">email</th>
              <th className="bg-gray-800 p-2">added at</th>
              <th className="bg-gray-800 p-2">invited at</th>
              <th className="bg-gray-800 p-2 rounded-tr">invited by</th>
            </tr>
          </thead>
          <tbody>
            {waitlisters.map((waitlister) => (
              <tr key={waitlister.id}>
                <td className="bg-black p-2">{waitlister.name}</td>
                <td className="bg-black p-2">{waitlister.email}</td>
                <td className="bg-black p-2">{formatDate(waitlister.createdAt)}</td>
                <td className="bg-black p-2">
                  {waitlister.invitedAt ? (
                    formatDate(waitlister.invitedAt)
                  ) : (
                    <button
                      onClick={() => markAsInvited(waitlister.id)}
                      className="cat-btn cat-btn-sm cat-btn-gold"
                    >
                      mark invited
                    </button>
                  )}
                </td>
                <td className="bg-black p-2">
                  {waitlister.invitedByUserProfile?.username || "---"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
