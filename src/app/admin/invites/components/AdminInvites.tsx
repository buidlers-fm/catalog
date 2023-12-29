"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getUserProfileLink } from "lib/helpers/general"
import { BASE_URLS_BY_ENV } from "lib/constants/urls"
import CopyableText from "app/components/CopyableText"

export const dynamic = "force-dynamic"

const env = process.env.NEXT_PUBLIC_CATALOG_ENV!
const INVITE_LINK_BASE_URL = `${BASE_URLS_BY_ENV[env]}/sign-up?invite_code=`

export default function AdminInvites() {
  const [createdInvite, setCreatedInvite] = useState<any>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [allInvites, setAllInvites] = useState<any[]>()

  function getInviteUrl(inviteCode: string) {
    return `${INVITE_LINK_BASE_URL}${inviteCode}`
  }

  const getAllInvites = useCallback(async () => {
    const _allInvites = await api.invites.get()
    setAllInvites(_allInvites)
  }, [])

  useEffect(() => {
    getAllInvites()
  }, [getAllInvites])

  async function createInvite() {
    const toastId = toast.loading("Creating invite...")

    try {
      const _createdInvite = await api.invites.create()

      setCreatedInvite(_createdInvite)

      toast.success("Invite created!", { id: toastId })

      await getAllInvites()
    } catch (error: any) {
      reportToSentry(error)
      setErrorMessage(error.message)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }
  }

  return (
    <div className="my-8 max-w-md mx-auto font-mulish">
      <button onClick={createInvite} className="cat-btn cat-btn-sm cat-btn-gold">
        create an invite
      </button>
      <div className="my-2">
        {createdInvite && (
          <div>
            <div>Invite created!</div>
            <CopyableText
              displayText={createdInvite.code}
              text={getInviteUrl(createdInvite.code)}
            />
          </div>
        )}
      </div>
      {errorMessage && <div className="my-2 text-red-300">{errorMessage}</div>}
      {allInvites && (
        <div className="my-8 text-sm">
          <table className="border-separate rounded bg-gray-800">
            <thead>
              <tr>
                <th className="bg-gray-800 p-2 rounded-tl">inviter</th>
                <th className="bg-gray-800 p-2">invited at</th>
                <th className="bg-gray-800 p-2">claimed at</th>
                <th className="bg-gray-800 p-2 rounded-tr">claimed by</th>
              </tr>
            </thead>
            <tbody>
              {allInvites.map((invite) => (
                <tr key={invite.id}>
                  <td className="bg-black p-2">{invite.inviter.username}</td>
                  <td className="bg-black p-2">{new Date(invite.createdAt).toLocaleString()}</td>
                  <td className="bg-black p-2">
                    {invite.claimedAt ? new Date(invite.claimedAt).toLocaleString() : "---"}
                  </td>
                  <td className="bg-black p-2">
                    {invite.claimedByUserProfile?.username ? (
                      <Link
                        href={getUserProfileLink(invite.claimedByUserProfile.username)}
                        className="cat-btn-link"
                        target="_blank"
                      >
                        {invite.claimedByUserProfile.username}
                      </Link>
                    ) : (
                      "---"
                    )}
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
