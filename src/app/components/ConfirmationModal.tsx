"use client"

import { Dialog } from "@headlessui/react"

export default function ConfirmationModal({
  title,
  onConfirm,
  onClose,
  isOpen,
  confirmColor = "cat-btn-red",
  confirmText = "delete",
}) {
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
            <div className="mb-12 text-center text-xl font-bold">{title}</div>
          </Dialog.Title>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleClose}
              className="cat-btn cat-btn-sm cat-btn-white-outline"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`cat-btn cat-btn-sm ${confirmColor} ml-4`}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
