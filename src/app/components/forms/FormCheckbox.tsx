type Props = {
  name: string
  isChecked?: boolean
  onChange?: (checked: boolean) => void
  labelText: string
  formProps?: any
  textColor?: string
  focusColor?: string
}

export default function FormCheckbox({
  name,
  isChecked,
  onChange,
  labelText,
  formProps,
  textColor = "text-gold-500",
  focusColor = "focus:ring-gold-500",
}: Props) {
  function handleChange(e) {
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  return (
    <div className="my-4 font-mulish text-white">
      <input
        type="checkbox"
        name={name}
        checked={formProps ? undefined : isChecked}
        onChange={formProps ? undefined : handleChange}
        className={`w-4 h-4 -mt-1 bg-gray-800 ${textColor} ${focusColor} rounded-sm`}
        {...formProps}
      />
      <label htmlFor={name} className="ml-2 text-sm">
        {labelText}
      </label>
    </div>
  )
}
