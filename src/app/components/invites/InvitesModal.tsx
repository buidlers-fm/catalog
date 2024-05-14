"use client"

import { Dialog } from "@headlessui/react"
import { BsXLg } from "react-icons/bs"
import CreateInvite from "app/components/invites/CreateInvite"

export default function InvitesModal({
  onClose,
  isOpen,
}: {
  onClose: () => void
  isOpen: boolean
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-40">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90vh] max-w-xs xs:max-w-md bg-gray-950 border border-gray-700 px-8 sm:px-16 py-8">
          <button onClick={onClose} className="absolute top-[24px] right-[24px]">
            <BsXLg className="text-xl" />
          </button>

          <div>
            <CreateInvite />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
