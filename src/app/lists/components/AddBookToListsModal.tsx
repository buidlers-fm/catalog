"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { toast } from "react-hot-toast"
import { BsXLg } from "react-icons/bs"
import { FaCheck, FaPlus } from "react-icons/fa6"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { useUser } from "lib/contexts/UserContext"
import { getNewListLink } from "lib/helpers/general"
import type List from "types/List"

export default function AddBookToListsModal({ book, userLists, onClose, isOpen }) {
  const router = useRouter()
  const { currentUser } = useUser()

  const [selectedLists, setSelectedLists] = useState<List[]>([])
  const [isBusy, setIsBusy] = useState<boolean>(false)

  const listsStr = `${selectedLists.length} ${selectedLists.length === 1 ? "list" : "lists"}`

  const toggleSelected = (list) => {
    if (isSelected(list)) {
      const _updated = selectedLists.filter((selectedList) => selectedList.id !== list.id)
      setSelectedLists(_updated)
    } else {
      const _updated = [...selectedLists, list]
      setSelectedLists(_updated)
    }
  }

  const isSelected = (list) => !!selectedLists.find((selectedList) => selectedList.id === list.id)

  const handleClose = async () => {
    await onClose()
  }

  const handleClickNewList = () => {
    if (!currentUser) return
    const newListUrl = `${getNewListLink(currentUser)}?with=${book.openLibraryWorkId}`
    router.push(newListUrl)
  }

  const handleSubmit = async () => {
    setIsBusy(true)
    const toastId = toast.loading("Adding book to list(s)...")

    const requestData = {
      book,
      listIds: selectedLists.map((selectedList) => selectedList.id),
    }

    try {
      await api.lists.addBook(requestData)

      toast.success(`Successfully added to ${listsStr}!`, { id: toastId })

      await onClose()
    } catch (error: any) {
      reportToSentry(error, requestData)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative max-w-lg rounded bg-gray-900 px-16 py-8">
          <Dialog.Title>
            <div className="grow mb-8 text-xl font-bold">add "{book.title}" to lists</div>
          </Dialog.Title>

          <button onClick={handleClose} className="absolute top-[24px] right-[16px]">
            <BsXLg className="text-xl" />
          </button>

          <div className="my-4 max-h-80 overflow-auto">
            <button
              type="button"
              onClick={handleClickNewList}
              disabled={isBusy}
              className="relative block w-full text-left py-2 px-10 bg-gray-800 text-gray-300 border border-gray-900 hover:text-white"
            >
              <FaPlus className="inline-block -mt-[5px] mr-2 text-xs" />
              start a new list...
            </button>
            {userLists.map((list) => (
              <button
                type="button"
                key={list.id}
                onClick={() => toggleSelected(list)}
                disabled={isBusy}
                className={`relative block w-full text-left py-2 px-10 ${
                  isSelected(list) ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-300"
                } border border-gray-900 hover:text-white`}
              >
                {isSelected(list) && (
                  <FaCheck className="absolute top-[10px] left-[16px] text-gold-500" />
                )}
                {list.title}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isBusy}
              className="cat-btn cat-btn-sm cat-btn-gold ml-4"
            >
              add to {listsStr}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
