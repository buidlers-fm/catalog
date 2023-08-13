export default function FormInput({ labelText, name, type, fullWidth = true }) {
  return (
    <div className="my-4 font-nunito-sans text-white">
      <div className="mb-1">
        <label htmlFor={name}>{labelText}</label>
      </div>
      <div>
        <input
          name={name}
          type={type}
          className={`${
            fullWidth ? "w-full" : "w-96"
          } px-3 pt-3 pb-2 bg-gray-900 rounded border-none focus:outline-orange-500`}
        />
      </div>
    </div>
  )
}
