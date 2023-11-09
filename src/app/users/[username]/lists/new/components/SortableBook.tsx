"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GiOpenBook } from "react-icons/gi"
import { BsXLg } from "react-icons/bs"
import { RxDragHandleDots2 } from "react-icons/rx"
import { truncateString } from "lib/helpers/general"

export default function SortableBook({ id, book, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
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
      className="flex items-center -my-[1px] px-2 py-3 bg-black border border-gray-700 first:rounded-tl first:rounded-tr last:rounded-bl last:rounded-br"
    >
      <div {...listeners} className="cursor-pointer shrink-0">
        <button type="button" className="">
          <RxDragHandleDots2 className="text-3xl text-gray-200" />
        </button>
      </div>
      <div className="w-[76px] h-[76px] shrink-0 flex items-center justify-center">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            className="w-auto h-[72px] shrink-0 rounded-sm"
            alt={`${book.title} cover`}
          />
        ) : (
          <div className="w-12 h-[72px] shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
            <GiOpenBook className="mt-0 text-4xl text-gray-500" />
          </div>
        )}
      </div>
      <div className="mx-4 grow">
        <div className="mt-[-8px] font-bold">{truncateString(book.title, 64)}</div>
        <div>{truncateString(book.authorName, 32)}</div>
      </div>
      <div className="shrink-0">
        <button onClick={() => onRemove(book)} className="p-2">
          <BsXLg className="text-xl text-gray-200" />
        </button>
      </div>
    </li>
  )
}
