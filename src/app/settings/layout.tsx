import SettingsTabs from "app/settings/components/SettingsTabs"

export default function SettingsLayout({ children }) {
  return (
    <div className="max-w-2xl mx-auto">
      <SettingsTabs />
      <div className="mt-8">{children}</div>
    </div>
  )
}
