import { Switch } from "@headlessui/react"
import { Control, Controller } from "react-hook-form"

type Props = {
  label: string
  descriptionText: string
  name: string
  control: Control<any>
  defaultValue: boolean
}

export default function FormToggle({
  label,
  descriptionText,
  name,
  control,
  defaultValue = false,
}: Props) {
  return (
    <div className="flex justify-between items-center w-full xs:w-96 my-4">
      <label htmlFor={name} className="flex flex-col justify-between">
        <div className="mb-2">
          <span>{label}</span>
        </div>
        {descriptionText && <span className="text-sm text-gray-200">{descriptionText}</span>}
      </label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onChange={field.onChange}
            className={`${field.value ? "bg-gold-500" : "bg-gold-900"}
            relative inline-flex items-center h-[26px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
          >
            <span className="sr-only">{label}</span>
            <span
              aria-hidden="true"
              className={`${field.value ? "translate-x-6" : "translate-x-0.5"}
              pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        )}
      />
    </div>
  )
}
