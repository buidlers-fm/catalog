import { GiOpenBook } from "react-icons/gi"
import { truncateString } from "lib/helpers/strings"

export default function CoverPlaceholder({
  sizeClasses: _sizeClasses,
  size = "md",
  loading = false,
  book,
}: {
  sizeClasses?: string
  size?: string
  loading?: boolean
  book?: any
}) {
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

  const containerSize = _sizeClasses || SIZE_CLASSES[size].container

  return (
    <div
      className={`${containerSize} shrink-0 flex flex-col items-center justify-center border-2 border-gray-500 box-border rounded font-mulish text-center`}
    >
      {loading ? (
        <span className="text-sm text-gray-200">Loading...</span>
      ) : book ? (
        <>
          <GiOpenBook className="hidden sm:block mb-4 sm:mb-2 text-8xl sm:text-4xl text-gray-500" />
          <div className="mb-2 sm:mb-0 text-sm">{truncateString(book.title, 20)}</div>
          <div className="text-sm">{truncateString(book.authorName, 20)}</div>
        </>
      ) : (
        <GiOpenBook className={`mt-0 ${SIZE_CLASSES[size].icon} text-gray-500`} />
      )}
    </div>
  )
}
