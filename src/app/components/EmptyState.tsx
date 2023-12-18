export default function EmptyState({ text, small = false }) {
  const smallClasses = "h-24"
  const largeClasses = "h-48 text-lg"

  return (
    <div
      className={`${
        small ? smallClasses : largeClasses
      } flex items-center justify-center font-newsreader italic text-gray-300`}
    >
      {text}
    </div>
  )
}
