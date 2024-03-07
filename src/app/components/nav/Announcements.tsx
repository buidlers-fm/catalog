import Link from "next/link"
import { useState } from "react"
import { BsEnvelopePaperHeartFill } from "react-icons/bs"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"

export default function Announcements({ isMobile, currentUserProfile }) {
  const _hasNewAnnouncements = currentUserProfile.config?.hasNewAnnouncements || false
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState<boolean>(_hasNewAnnouncements)

  let buttonClasses
  if (isMobile) {
    if (hasNewAnnouncements) {
      buttonClasses = "ml-3 mr-2"
    } else {
      buttonClasses = "mt-2 ml-3 mr-2"
    }
  } else if (hasNewAnnouncements) {
    buttonClasses = "-mt-2 mr-2"
  } else {
    buttonClasses = "mr-2"
  }

  const iconOpenClasses = isMobile ? "text-[24px]" : "text-[22px]"
  // const iconClosedClasses = isMobile ? "text-[24px]" : "text-[22px]"

  async function readAnnouncements() {
    if (!hasNewAnnouncements) return

    const requestData = {
      hasNewAnnouncements: false,
    }

    try {
      await api.userConfigs.update(requestData)
    } catch (error: any) {
      reportToSentry(error, requestData)
    }

    setHasNewAnnouncements(false)
  }

  if (!hasNewAnnouncements) return null

  return (
    <button className={`relative ${buttonClasses}`} onClick={readAnnouncements}>
      <Link href="/guide">
        {/* for if we need to differentiate between read/unread icons again
          {hasNewAnnouncements ? (
            <>
              <BsEnvelopePaperHeartFill className={`${iconOpenClasses} text-gray-200`} />
              <span className="w-1.5 h-1.5 absolute top-3 -right-1.5 rounded-full bg-red-300" />
            </>
          ) : (
            <BsEnvelopeFill className={`${iconClosedClasses} text-gray-500`} />
          )}
        */}
        <BsEnvelopePaperHeartFill className={`${iconOpenClasses} text-gray-200`} />
        <span className="w-1.5 h-1.5 absolute top-3 -right-1.5 rounded-full bg-red-300" />
      </Link>
    </button>
  )
}
