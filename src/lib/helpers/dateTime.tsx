import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { dateTimeFormats } from "lib/constants/dateTime"
import TimestampTooltip from "app/components/TimestampTooltip"

dayjs.extend(relativeTime)

const { longAmericanDate: timestampFormat } = dateTimeFormats

function getFormattedTimestamps(dateStr: string, tooltipAnchorId?: string) {
  const fromNow = dayjs(dateStr).fromNow()
  const formatted = dayjs(dateStr).format(timestampFormat)

  let tooltip
  if (tooltipAnchorId) {
    tooltip = <TimestampTooltip anchorId={tooltipAnchorId} timestampStr={formatted} />
  }

  return { fromNow, formatted, tooltip }
}

export { getFormattedTimestamps }
