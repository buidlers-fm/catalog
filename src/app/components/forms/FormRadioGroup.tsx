"use client"

import { useState, Fragment } from "react"
import { RadioGroup } from "@headlessui/react"

type Item = {
  value: string
  label: string
}

type Props = {
  label?: string
  helperText?: string
  items: Item[]
  defaultItemIndex?: number
  onChange?: (selectedItem: Item) => void
}

export default function FormRadioGroup({
  label,
  helperText,
  items,
  defaultItemIndex = 0,
  onChange,
}: Props) {
  const [selectedItem, setSelectedItem] = useState<Item>(items[defaultItemIndex])

  function handleSelect(selectedItemId) {
    const _selectedItem = items.find((item) => item.value === selectedItemId)
    setSelectedItem(_selectedItem!)
    if (onChange) onChange(_selectedItem!)
  }

  return (
    <RadioGroup value={selectedItem?.value} onChange={handleSelect}>
      {label && (
        <RadioGroup.Label>
          <div className="text-md">{label}</div>
        </RadioGroup.Label>
      )}

      <div className="flex gap-x-2">
        {items.map((item) => (
          <RadioGroup.Option key={item.value} value={item.value} as={Fragment}>
            {({ checked }) => (
              <li
                className={`${
                  checked
                    ? "border-2 border-gold-500 text-gold-500 font-semibold"
                    : "bg-black border border-gray-500 text-white"
                }
            inline-block list-none cursor-pointer my-2 px-3 py-2 rounded`}
              >
                {item.label}
              </li>
            )}
          </RadioGroup.Option>
        ))}
      </div>

      {helperText && <div className="text-sm text-gray-300">{helperText}</div>}
    </RadioGroup>
  )
}
