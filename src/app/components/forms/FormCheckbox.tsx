export default function FormCheckbox({
  name,
  isChecked,
  onChange,
  labelText,
  textColor = "text-gold-500",
  focusColor = "focus:ring-gold-500",
}) {
  function handleChange(e) {
    onChange(e.target.checked)
  }

  return (
    <div className="my-4 font-mulish text-white">
      <input
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={handleChange}
        className={`w-4 h-4 -mt-1 bg-gray-800 ${textColor} ${focusColor} rounded-sm`}
      />
      <label htmlFor="subscribe" className="ml-2 text-sm">
        {labelText}
      </label>
    </div>
  )
}
