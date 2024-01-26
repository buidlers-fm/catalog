import { Switch } from "@headlessui/react"
import { Control, Controller } from "react-hook-form"

type Props = {
  label: string
  descriptionText?: string
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
    <div className="flex justify-between items-center w-full my-4">
      <label htmlFor={name} className="flex flex-col justify-between">
        <div className="mb-2 font-mulish">
          <span>{label}</span>
        </div>
        {descriptionText && <span className="text-sm mr-4 text-gray-200">{descriptionText}</span>}
      </label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          // from Tailwind UI: https://tailwindui.com/components/application-ui/forms/toggles
          <Switch
            checked={field.value}
            onChange={field.onChange}
            className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
          >
            <span className="sr-only">{label}</span>
            <span
              aria-hidden="true"
              className={`${field.value ? "bg-gold-500" : "bg-gold-900"}
                 pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out`}
            />
            <span
              aria-hidden="true"
              className={`${field.value ? "translate-x-5" : "translate-x-0"}
                pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out`}
            />
          </Switch>
        )}
      />
    </div>
  )
}
