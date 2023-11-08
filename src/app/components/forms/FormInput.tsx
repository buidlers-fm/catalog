type Props = {
  labelText: string
  name: string
  type: string
  formProps?: any
  errorMessage?: string
  fullWidth?: boolean
  [moreProps: string]: any
}

export default function FormInput({
  labelText,
  name,
  type,
  formProps = {},
  errorMessage,
  fullWidth = true,
  ...moreProps
}: Props) {
  return (
    <div className="my-4 font-nunito-sans text-white">
      <div className="mb-1">
        <label htmlFor={name}>{labelText}</label>
      </div>
      <div>
        <input
          name={name}
          type={type}
          {...formProps}
          {...moreProps}
          className={`${
            fullWidth ? "w-full" : "w-full xs:w-96"
          } px-3 pt-3 pb-2 bg-gray-900 disabled:text-gray-500 rounded border-none focus:outline-gold-500`}
        />
      </div>
      {errorMessage && <div className="my-2 text-red-500">{errorMessage}</div>}
    </div>
  )
}