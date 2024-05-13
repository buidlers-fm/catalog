"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { BASE_URLS_BY_ENV } from "lib/constants/urls"
import CopyableText from "app/components/CopyableText"

export const dynamic = "force-dynamic"

const env = process.env.NEXT_PUBLIC_CATALOG_ENV!
const INVITE_LINK_BASE_URL = `${BASE_URLS_BY_ENV[env]}/sign-up?invite_code=`

type Props = {
  onSuccess?: () => void
  isAdmin?: boolean
}

export default function CreateInvite({ onSuccess, isAdmin = false }: Props) {
  const [createdInvite, setCreatedInvite] = useState<any>()
  const [errorMessage, setErrorMessage] = useState<string>()

  function getInviteUrl(inviteCode: string) {
    return `${INVITE_LINK_BASE_URL}${inviteCode}`
  }

  async function create(singleUse: boolean) {
    const requestData = {
      singleUse,
    }

    const toastId = toast.loading("Creating invite...")

    try {
      const _createdInvite = await api.invites.create(requestData)

      setCreatedInvite(_createdInvite)

      toast.success("Invite created!", { id: toastId })

      if (onSuccess) await onSuccess()
    } catch (error: any) {
      reportToSentry(error)
      setErrorMessage(error.message)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }
  }

  return (
    <div className="font-mulish">
      {isAdmin ? (
        <>
          <div className="mb-2">create an invite</div>
          <button onClick={() => create(true)} className="mr-4 cat-btn cat-btn-sm cat-btn-gold">
            single
          </button>
          <button onClick={() => create(false)} className="cat-btn cat-btn-sm cat-btn-gold">
            multi (30-day)
          </button>
        </>
      ) : (
        <>
          <div className="mb-2">invite a friend</div>
          <button onClick={() => create(true)} className="cat-btn cat-btn-sm cat-btn-gold">
            {createdInvite ? "create another invite link" : "create an invite link"}
          </button>
          <div className="my-2 text-sm text-gray-300">
            Each invite link can only be claimed once. You can create as many invite links as you
            want. The links never expire.
          </div>
        </>
      )}
      <div className="my-2">
        {createdInvite && (
          <div>
            <div>
              {createdInvite.expiresAt ? "30-day" : "single-use"} invite created
              {!isAdmin && " (click icon to copy the link)"}:
            </div>
            <CopyableText
              displayText={createdInvite.code}
              text={getInviteUrl(createdInvite.code)}
            />
          </div>
        )}
      </div>
      {errorMessage && <div className="my-2 text-red-300">{errorMessage}</div>}
    </div>
  )
}
