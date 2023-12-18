import FormattingReferenceTooltip from "app/components/FormattingReferenceTooltip"

type Props = {
  labelText?: string
  name: string
  type: string
  formProps?: any
  remainingChars?: number
  showFormattingReferenceTooltip?: boolean
  errorMessage?: string
  fullWidth?: boolean
  [moreProps: string]: any
}

export default function FormTextarea({
  labelText,
  name,
  type,
  rows = 3,
  formProps = {},
  remainingChars,
  showFormattingReferenceTooltip = true,
  errorMessage,
  moreClasses,
  bgColor = "bg-gray-900",
  fullWidth = true,
  ...moreProps
}: Props) {
  const showRemainingChars = remainingChars || remainingChars === 0
  const textFormattingAndRemainingChars =
    showFormattingReferenceTooltip || showRemainingChars ? (
      <div className="flex justify-between">
        {showFormattingReferenceTooltip ? <FormattingReferenceTooltip /> : <div />}
        {showRemainingChars && (
          <div className={`text-sm ${remainingChars < 0 ? "text-red-500" : "text-gray-300"}`}>
            {remainingChars}
          </div>
        )}
      </div>
    ) : null

  return (
    <div className="my-4 font-mulish text-white">
      {labelText && (
        <div className="mb-1">
          <label htmlFor={name}>{labelText}</label>
        </div>
      )}
      <div className={`${fullWidth ? "w-full" : "w-full xs:w-96"}`}>
        <textarea
          name={name}
          rows={rows}
          {...formProps}
          {...moreProps}
          className={`w-full px-3 pt-3 pb-2 ${bgColor} rounded border-none focus:outline-gold-500 ${moreClasses}`}
        />
        {textFormattingAndRemainingChars}
        {errorMessage && <div className="my-2 text-red-500">{errorMessage}</div>}
      </div>
    </div>
  )
}
