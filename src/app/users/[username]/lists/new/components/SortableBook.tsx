"use client"

import { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GiOpenBook } from "react-icons/gi"
import { BsXLg } from "react-icons/bs"
import { RxDragHandleDots2 } from "react-icons/rx"
import { truncateString } from "lib/helpers/general"
import validations from "lib/constants/validations"
import FormTextarea from "app/components/forms/FormTextarea"

export default function SortableBook({
  id,
  book,
  onRemove,
  isRanked,
  rank,
  notesEnabled = false,
  note: _note,
  onNoteChange,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const [note, setNote] = useState<string>(_note)
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false)

  useEffect(() => {
    setNote(_note)
  }, [_note])

  async function handleEditedNote(text) {
    setIsEditingNote(false)
    await onNoteChange(id, text)
  }

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
      <div className="flex flex-col sm:flex-row shrink-0 items-center">
        <div {...listeners} className="shrink-0">
          <button type="button" className="block hover:cursor-grab active:cursor-grabbing">
            <RxDragHandleDots2 className="text-3xl text-gray-200" />
          </button>
        </div>
        {isRanked && (
          <div className="w-[30px] h-auto sm:w-14 sm:h-14 shrink-0 my-2 sm:mx-2 flex justify-center items-center border rounded border-gray-700">
            {rank}
          </div>
        )}
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
        {isEditingNote ? (
          <EditNote
            note={note}
            onCancel={() => setIsEditingNote(false)}
            onDone={handleEditedNote}
          />
        ) : (
          <>
            <div className="mt-[-8px] font-bold">{truncateString(book.title, 64)}</div>
            <div>{truncateString(book.authorName, 32)}</div>
            {notesEnabled &&
              (note ? (
                <div className="text-gray-300">
                  {truncateString(note, 40)}
                  <button
                    onClick={() => setIsEditingNote(true)}
                    className="ml-2 cat-btn-link text-sm text-gray-300"
                  >
                    edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="cat-btn-link text-sm text-gray-300"
                >
                  add note
                </button>
              ))}
          </>
        )}
      </div>
      <div className="shrink-0">
        <button onClick={() => onRemove(book)} className="p-2">
          <BsXLg className="text-xl text-gray-200" />
        </button>
      </div>
    </li>
  )
}

function EditNote({ note, onCancel, onDone }) {
  const [text, setText] = useState<string>(note)
  const [textErrorMsg, setTextErrorMsg] = useState<string>()

  const { maxLength } = validations.list.bookNote

  function handleDone() {
    if (text && text.length > maxLength) {
      setTextErrorMsg(`Note cannot be more than ${maxLength} characters.`)
      return
    }

    const finalText = text === "" ? null : text

    onDone(finalText)
  }

  return (
    <>
      <FormTextarea
        name="text"
        type="text"
        rows={2}
        remainingChars={maxLength - (text?.length || 0)}
        errorMessage={textErrorMsg}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        showFormattingReferenceTooltip={false}
      />
      <div className="flex justify-end">
        <button className="mr-2 cat-btn cat-btn-sm cat-btn-white-outline" onClick={onCancel}>
          cancel
        </button>
        <button className="cat-btn cat-btn-sm cat-btn-teal" onClick={handleDone}>
          done
        </button>
      </div>
    </>
  )
}
