import { Tooltip } from "react-tooltip"

export default function TimestampTooltip({ anchorId, timestampStr }) {
  return (
    <Tooltip anchorSelect={`#${anchorId}`} className="max-w-[240px] font-mulish">
      <div className="text-center">{timestampStr}</div>
    </Tooltip>
  )
}
