import EmptyState from "app/components/EmptyState"

export default function LoadingSection({ small = false }) {
  return <EmptyState text="Loading..." small={small} />
}
