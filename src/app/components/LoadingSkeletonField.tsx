export default function LoadingSkeleton({ moreClasses }) {
  return (
    <div
      className={`bg-[length:400%] bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 animate-pulse-horizontal ${moreClasses}`}
    />
  )
}
