import InboxTabs from "app/inbox/components/InboxTabs"

export default function InboxLayout({ children }) {
  return (
    <div className="max-w-2xl mx-auto">
      <InboxTabs />
      <div className="mt-8">{children}</div>
    </div>
  )
}
