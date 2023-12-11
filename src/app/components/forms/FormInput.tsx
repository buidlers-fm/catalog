type Props = {
  labelText?: string
  name: string
  type: string
  descriptionText?: string
  accentColor?: string
  formProps?: any
  remainingChars?: number
  errorMessage?: string
  fullWidth?: boolean
  [moreProps: string]: any
}

export default function FormInput({
  labelText,
  name,
  type,
  descriptionText,
  accentColor = "gold",
  bgColor = "bg-gray-900",
  formProps = {},
  remainingChars,
  errorMessage,
  fullWidth = true,
  ...moreProps
}: Props) {
  const accentColorClassMappings = {
    gold: "focus:outline-gold-500",
    teal: "focus:outline-teal-500",
  }

  const accentColorClasses = accentColorClassMappings[accentColor]

  return (
    <div className="my-4 font-mulish text-white">
      {labelText && (
        <div className="mb-2">
          <label htmlFor={name}>{labelText}</label>
        </div>
      )}
      {descriptionText && <div className="mb-2 text-sm text-gray-200">{descriptionText}</div>}
      <div className={`${fullWidth ? "w-full" : "w-full xs:w-96"}`}>
        <input
          name={name}
          type={type}
          {...formProps}
          {...moreProps}
          className={`w-full mb-2 px-3 pt-3 pb-2 ${bgColor} disabled:text-gray-500 rounded border-none ${accentColorClasses}`}
        />
        {(remainingChars || remainingChars === 0) && (
          <div
            className={`flex justify-end text-sm ${
              remainingChars < 0 ? "text-red-500" : "text-gray-300"
            }`}
          >
            {remainingChars}
          </div>
        )}
      </div>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </div>
  )
}
