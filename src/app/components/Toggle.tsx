import { useState } from "react"
import { Switch } from "@headlessui/react"

type Props = {
  label: string
  descriptionText?: string
  name: string
  defaultValue: boolean
  compact?: boolean
  onChange: (value: boolean) => void
}

export default function Toggle({
  label,
  descriptionText,
  name,
  defaultValue = false,
  compact = false,
  onChange = () => {},
}: Props) {
  const [enabled, setEnabled] = useState(defaultValue)

  return (
    <div className={`flex ${compact ? "gap-x-3" : "justify-between"} items-center w-full my-4`}>
      <label htmlFor={name} className="flex flex-col justify-between">
        <div className="mb-2 mr-2 font-mulish">
          <span>{label}</span>
        </div>
        {descriptionText && <span className="text-sm mr-4 text-gray-200">{descriptionText}</span>}
      </label>
      <Switch
        checked={enabled}
        onChange={(value) => {
          setEnabled(value)
          onChange(value)
        }}
        className="group relative -mt-1.5 inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`${enabled ? "bg-gold-500" : "bg-gold-900"}
                 pointer-events-none absolute mx-auto h-4 w-8 rounded-full transition-colors duration-200 ease-in-out`}
        />
        <span
          aria-hidden="true"
          className={`${enabled ? "translate-x-[14px]" : "translate-x-0"}
                pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  )
}
