import { GiOpenBook } from "react-icons/gi"

export default function CoverPlaceholder({ loading = false }) {
  return (
    <div className="w-[256px] h-[410px] shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded font-mulish text-center">
      {loading ? (
        <span className="text-sm text-gray-200">Loading...</span>
      ) : (
        <GiOpenBook className="mt-0 text-9xl text-gray-500" />
      )}
    </div>
  )
}
