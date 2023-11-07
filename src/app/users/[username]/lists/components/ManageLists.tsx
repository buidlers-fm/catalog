"use client"

import Link from "next/link"
import { useState } from "react"
import humps from "humps"
import { DndContext, closestCenter } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { RxDragHandleDots2 } from "react-icons/rx"
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs"
import { MdEdit } from "react-icons/md"
import { toast } from "react-hot-toast"
import { useUser } from "lib/contexts/UserContext"
import { fetchJson, sortListsByPinSortOrder, getEditListLink } from "lib/helpers/general"
import ListCard from "app/components/lists/ListCard"
import type List from "types/List"

export default function ManageLists({ lists, pins }) {
  const { currentUser } = useUser()
  const [isBusy, setIsBusy] = useState<boolean>(false)

  const defaultPinnedLists = sortListsByPinSortOrder(lists, pins)

  const [pinnedLists, setPinnedLists] = useState<List[]>(defaultPinnedLists)

  const isListInSet = (list, allLists) => !!allLists.find((l) => l.id === list.id)

  const isListPinned = (list) => isListInSet(list, pinnedLists)

  const pinList = async (list) => {
    const requestData = {
      pinnedObjectId: list.id,
      pinnedObjectType: "list",
    }

    setIsBusy(true)
    const toastId = toast.loading(`Pinning "${list.title}"...`)

    try {
      await fetchJson("/api/pins", {
        method: "POST",
        body: JSON.stringify(humps.decamelizeKeys(requestData)),
      })

      toast.success("Pin saved!", { id: toastId })

      const _updated = [...pinnedLists, list]
      setPinnedLists(_updated)
    } catch (error: any) {
      console.error(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  const unpinList = async (list) => {
    const requestData = {
      pinnedObjectId: list.id,
      pinnedObjectType: "list",
    }

    const queryString = new URLSearchParams(humps.decamelizeKeys(requestData)).toString()
    const url = `/api/pins?${queryString}`

    setIsBusy(true)
    const toastId = toast.loading(`Unpinning "${list.title}"...`)

    try {
      await fetchJson(url, {
        method: "DELETE",
        body: JSON.stringify(humps.decamelizeKeys(requestData)),
      })

      toast.success("List has been unpinned.", { id: toastId })

      const _updated = pinnedLists.filter((pinnedList) => pinnedList.id !== list.id)
      setPinnedLists(_updated)
    } catch (error: any) {
      console.error(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  const unpinnedLists = lists.filter((list) => !isListPinned(list))

  const pinnedListIds = pinnedLists.map((list) => list.id!)

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id === over.id) return

    const oldIndex = pinnedListIds.indexOf(active.id)
    const newIndex = pinnedListIds.indexOf(over.id)

    const _originalPinnedLists = [...pinnedLists]
    const _reorderedPinnedLists = arrayMove([...pinnedLists], oldIndex, newIndex)
    setPinnedLists(_reorderedPinnedLists)

    const requestData = {
      orderedPinnedObjects: _reorderedPinnedLists,
    }

    setIsBusy(true)
    const toastId = toast.loading("Reordering pinned lists...")

    try {
      await fetchJson("/api/pins", {
        method: "PATCH",
        body: JSON.stringify(humps.decamelizeKeys(requestData)),
      })

      toast.success("Pinned lists order saved!", { id: toastId })
    } catch (error: any) {
      console.error(error)
      toast.error("Hmm, something went wrong.", { id: toastId })
      setPinnedLists(_originalPinnedLists)
    }

    setIsBusy(false)
  }

  return (
    <div className="mt-4 max-w-3xl mx-auto font-nunito-sans">
      <div className="text-3xl">Your lists</div>
      <div className="mt-8 flex justify-end">
        <Link href="/lists/new">
          <button className="cat-btn cat-btn-sm cat-btn-gray ml-4">+ Create a list</button>
        </Link>
      </div>
      <div className="my-4">Pinned lists appear on your profile.</div>
      {lists.length > 0 ? (
        <ul className="">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pinnedListIds} strategy={verticalListSortingStrategy}>
              {pinnedLists.map((list) => (
                <ListRowPinned
                  key={list.id}
                  list={list}
                  unpinList={unpinList}
                  currentUser={currentUser}
                  isBusy={isBusy}
                />
              ))}
              {unpinnedLists.map((list) => (
                <ListRowUnpinned
                  key={list.id}
                  list={list}
                  pinList={pinList}
                  currentUser={currentUser}
                  isBusy={isBusy}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      ) : (
        <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
          You don't have any lists yet.
        </div>
      )}
    </div>
  )
}

function ListRowPinned({ list, unpinList, currentUser, isBusy }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
  })

  const style = {
    cursor: "default",
    position: "relative" as any,
    zIndex: isDragging ? 1 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-wrap items-center px-4 py-2 bg-black border border-gray-500 first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br"
    >
      <div {...listeners} className="shrink-0 w-12 cursor-pointer">
        <button type="button" disabled={isBusy} className="">
          <RxDragHandleDots2 className="mx-auto text-3xl text-gray-200" />
        </button>
      </div>
      <div className="sm:grow w-3/4">
        <ListCard key={list.id} list={list} separators={false} compact />
      </div>
      <div className="ml-auto">
        <Link href={currentUser ? getEditListLink(currentUser, list.slug) : ""}>
          <button type="button" disabled={isBusy} className="mr-4">
            <MdEdit className="text-2xl text-gray-500" />
          </button>
        </Link>
        <button type="button" onClick={() => unpinList(list)} disabled={isBusy} className="sm:mr-4">
          <BsPinAngleFill className="text-2xl text-gold-500" />
        </button>
      </div>
    </li>
  )
}

function ListRowUnpinned({ list, pinList, currentUser, isBusy }) {
  return (
    <li className="flex flex-wrap items-center px-4 py-2 bg-black border border-gray-500 first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br">
      <div className="shrink-0 w-12" />
      <div className="sm:grow w-3/4">
        <ListCard key={list.id} list={list} separators={false} compact />
      </div>
      <div className="ml-auto">
        <Link href={currentUser ? getEditListLink(currentUser, list.slug) : ""}>
          <button type="button" disabled={isBusy} className="mr-4">
            <MdEdit className="text-2xl text-gray-500" />
          </button>
        </Link>
        <button type="button" onClick={() => pinList(list)} disabled={isBusy} className="sm:mr-4">
          <BsPinAngle className="text-2xl text-gray-300" />
        </button>
      </div>
    </li>
  )
}
