"use client"

import { Dialog } from "@headlessui/react"

export default function ConfirmationModal({ onConfirm, onClose, isOpen }) {
  const handleClose = async () => {
    await onClose()
  }

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded bg-gray-900 px-12 py-8">
          <Dialog.Title>
            <div className="mb-12 text-center text-xl font-bold">Delete this list?</div>
          </Dialog.Title>

          <div className="flex justify-center">
            <button type="button" onClick={handleClose} className="cat-btn cat-btn-white-outline">
              Cancel
            </button>
            <button type="button" onClick={handleConfirm} className="cat-btn cat-btn-red ml-4">
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
