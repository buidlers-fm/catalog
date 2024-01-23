import { useState } from "react"
import { truncateString } from "lib/helpers/general"
import CustomMarkdown from "app/components/CustomMarkdown"

export default function ExpandableText({ text, maxChars = 500, expanded = false }) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  return text?.length && text.length > maxChars ? (
    <>
      <span className="mr-2">
        <CustomMarkdown markdown={isExpanded ? text : truncateString(text, maxChars)} />
      </span>
      <button className="cat-eyebrow" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "less" : "more"}
      </button>
    </>
  ) : (
    <CustomMarkdown markdown={text} />
  )
}
