import { useState } from "react"
import { BsLink45Deg } from "react-icons/bs"
import { FaCheck } from "react-icons/fa6"
import toast from "react-hot-toast"

export default function CopyableLinkButton({ url }: { url: string }) {
  const [isCopied, setIsCopied] = useState<boolean>(false)

  function copyText() {
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)

    toast.success("Link copied to clipboard!")
  }

  return (
    <button onClick={copyText} disabled={isCopied} className="ml-4">
      {isCopied ? (
        <FaCheck className="text-lg text-gray-300" />
      ) : (
        <BsLink45Deg className="text-xl text-gray-300" />
      )}
    </button>
  )
}
