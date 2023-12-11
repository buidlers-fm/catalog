import { useState } from "react"
import { truncateString } from "lib/helpers/general"

export default function ExpandableText({ text, maxChars = 500 }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return text?.length && text.length > maxChars ? (
    <>
      <span className="mr-2">{isExpanded ? text : truncateString(text, maxChars)}</span>
      <button className="cat-eyebrow" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "Less" : "More"}
      </button>
    </>
  ) : (
    text
  )
}
