type Props = {
  labelText: string
  name: string
  type: string
  formProps?: any
  remainingChars?: number
  errorMessage?: string
  fullWidth?: boolean
  [moreProps: string]: any
}

export default function FormTextarea({
  labelText,
  name,
  type,
  formProps = {},
  remainingChars,
  errorMessage,
  fullWidth = true,
  ...moreProps
}: Props) {
  return (
    <div className="my-4 font-nunito-sans text-white">
      <div className="mb-1">
        <label htmlFor={name}>{labelText}</label>
      </div>
      <div className={`${fullWidth ? "w-full" : "w-full xs:w-96"}`}>
        <textarea
          name={name}
          rows={3}
          {...formProps}
          {...moreProps}
          className="w-full px-3 pt-3 pb-2 bg-gray-900 rounded border-none focus:outline-gold-500"
        />
        {remainingChars && (
          <div
            className={`flex justify-end text-sm ${
              remainingChars < 0 ? "text-red-500" : "text-gray-300"
            }`}
          >
            {remainingChars}
          </div>
        )}
      </div>
      {errorMessage && <div className="my-2 text-red-500">{errorMessage}</div>}
    </div>
  )
}
