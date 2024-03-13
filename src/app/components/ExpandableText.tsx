import { useState } from "react"
import { truncateString } from "lib/helpers/strings"
import CustomMarkdown from "app/components/CustomMarkdown"

export default function ExpandableText({ text, maxChars = 500, expanded = false }) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  return text?.length && text.length > maxChars ? (
    <>
      <div className="">
        <CustomMarkdown markdown={isExpanded ? text : truncateString(text, maxChars)} />
      </div>
      <button className="cat-eyebrow" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "less" : "more"}
      </button>
    </>
  ) : (
    <CustomMarkdown markdown={text} />
  )
}
