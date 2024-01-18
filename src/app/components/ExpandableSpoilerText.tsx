import { useState } from "react"
import ExpandableText from "app/components/ExpandableText"

export default function ExpandableSpoilerText({ text, maxChars = 500 }) {
  const [isSpoiled, setIsSpoiled] = useState(false)

  return isSpoiled ? (
    <ExpandableText text={text} maxChars={maxChars} expanded />
  ) : (
    <span className="mr-2">
      This note contains spoilers.{" "}
      <button className="cat-link" onClick={() => setIsSpoiled(!isSpoiled)}>
        Read on.
      </button>
    </span>
  )
}
