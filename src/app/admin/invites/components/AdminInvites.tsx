"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import api from "lib/api"
import { getUserProfileLink } from "lib/helpers/general"
import CreateInvite from "app/components/invites/CreateInvite"

export const dynamic = "force-dynamic"

export default function AdminInvites() {
  const [allInvites, setAllInvites] = useState<any[]>()

  const getAllInvites = useCallback(async () => {
    const _allInvites = await api.invites.get()
    setAllInvites(_allInvites)
  }, [])

  useEffect(() => {
    getAllInvites()
  }, [getAllInvites])

  return (
    <div className="my-8 max-w-md mx-auto font-mulish">
      <CreateInvite isAdmin onSuccess={getAllInvites} />

      {allInvites && (
        <div className="my-8 text-sm">
          <table className="border-separate rounded bg-gray-800">
            <thead>
              <tr>
                <th className="bg-gray-800 p-2 rounded-tl">inviter</th>
                <th className="bg-gray-800 p-2">invited at</th>
                <th className="bg-gray-800 p-2">type</th>
                <th className="bg-gray-800 p-2 rounded-tr">claimed by</th>
              </tr>
            </thead>
            <tbody>
              {allInvites.map((invite) => (
                <tr key={invite.id}>
                  <td className="bg-black p-2">{invite.inviter.username}</td>
                  <td className="bg-black p-2">{new Date(invite.createdAt).toLocaleString()}</td>
                  <td className="bg-black p-2">
                    {invite.expiresAt
                      ? `30-day${new Date(invite.expiresAt) < new Date() ? " (expired)" : ""}`
                      : "single"}
                  </td>
                  <td className="bg-black p-2">
                    {invite.claimedByUserProfiles.length > 0
                      ? invite.claimedByUserProfiles.map((userProfile, index) => (
                          <div key={userProfile.id}>
                            <Link
                              href={getUserProfileLink(userProfile.username)}
                              className="cat-btn-link"
                              target="_blank"
                            >
                              {userProfile.username}
                            </Link>
                            {index < invite.claimedByUserProfiles.length - 1 && ", "}
                          </div>
                        ))
                      : "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
