import { GiOpenBook } from "react-icons/gi"

export default function CoverPlaceholder({ size = "md", loading = false }) {
  const SIZE_CLASSES = {
    sm: {
      container: "w-[64px] h-[96px]",
      icon: "text-4xl",
    },
    md: {
      container: "w-[144px] h-[216px]",
      icon: "text-7xl",
    },
    lg: {
      container: "w-[256px] h-[384px]",
      icon: "text-9xl",
    },
  }

  const sizeClasses = SIZE_CLASSES[size]

  return (
    <div
      className={`${sizeClasses.container} shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded font-mulish text-center`}
    >
      {loading ? (
        <span className="text-sm text-gray-200">Loading...</span>
      ) : (
        <GiOpenBook className={`mt-0 ${sizeClasses.icon} text-gray-500`} />
      )}
    </div>
  )
}
