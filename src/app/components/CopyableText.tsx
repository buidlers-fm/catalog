import { useState } from "react"
import { MdContentCopy } from "react-icons/md"

export default function CopyableText({
  text,
  displayText,
  iconOnly = false,
}: {
  text: string
  displayText?: string
  iconOnly?: boolean
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false)

  function copyText() {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div>
      {!iconOnly && (
        <input
          type="text"
          className="my-2 px-3 pt-3 pb-2 bg-gray-900 disabled:text-gray-300 rounded border-none"
          value={displayText || text}
          disabled
        />
      )}
      <button onClick={copyText} disabled={isCopied} className="ml-4">
        {isCopied ? "Copied!" : <MdContentCopy className="" />}
      </button>
    </div>
  )
}
