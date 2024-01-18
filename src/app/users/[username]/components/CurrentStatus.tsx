import Link from "next/link"
import { isMobile } from "react-device-detect"
import { getBookLink } from "lib/helpers/general"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import UserProfile from "lib/models/UserProfile"
import { useUser } from "lib/contexts/UserContext"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookTooltip from "app/components/books/BookTooltip"
import CustomMarkdown from "app/components/CustomMarkdown"
import Likes from "app/components/Likes"
import InteractionObjectType from "enums/InteractionObjectType"

export default function CurrentStatus({
  userProfile: _userProfile,
  userCurrentStatus,
  isUsersProfile = false,
  isProfilePage = true,
}) {
  const { currentUserProfile } = useUser()

  const userProfile = UserProfile.build(_userProfile)
  const { name } = userProfile
  const { text, book, createdAt, currentUserLike } = userCurrentStatus || {}

  const bookTooltipAnchorId =
    userCurrentStatus && book ? `current-status-book-${userCurrentStatus.id}` : undefined

  const timestampTooltipAnchorId = userCurrentStatus
    ? `current-status-created-at-${userCurrentStatus.id}`
    : undefined

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  return userCurrentStatus ? (
    <div>
      <div className={`flex flex-row ${isProfilePage && "lg:flex-col"}`}>
        {book && (
          <>
            <div
              id={bookTooltipAnchorId}
              className={`shrink-0 w-[72px] xs:w-[96px] ml-4 mr-6 my-4 ${
                isProfilePage && "lg:w-2/3 lg:mx-auto lg:mt-6"
              }`}
            >
              <Link href={getBookLink(book.slug)}>
                <button disabled={isMobile}>
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt="cover"
                      className="object-top mx-auto shadow-md rounded-sm"
                    />
                  ) : (
                    <CoverPlaceholder
                      book={book}
                      sizeClasses={`w-[72px] h-[108px] xs:w-[96px] xs:h-[144px] ${
                        isProfilePage && "lg:w-[144px] lg:h-[216px]"
                      }`}
                    />
                  )}
                </button>
              </Link>
            </div>
            <BookTooltip book={book} anchorSelect={`#${bookTooltipAnchorId}`} />
          </>
        )}
        {text && (
          <div className="grow">
            <div className={`mt-4 mb-2 ${isProfilePage && "lg:my-2"} font-newsreader`}>
              <CustomMarkdown markdown={text} />
            </div>
          </div>
        )}
      </div>

      {isProfilePage && (
        <>
          <div className="-mt-1 mb-2 text-sm text-gray-500">
            posted <span id={timestampTooltipAnchorId}>{createdAtFromNow}</span>
          </div>
          {timestampTooltip}
        </>
      )}

      <Likes
        interactive={!!currentUserProfile}
        likedObject={userCurrentStatus}
        likedObjectType={InteractionObjectType.UserCurrentStatus}
        currentUserLike={currentUserLike}
      />
    </div>
  ) : (
    <div className="py-8 px-4 flex items-center justify-center font-newsreader italic text-gray-300">
      {isUsersProfile ? "What's on your mind?" : `${name}'s current status is a mystery.`}
    </div>
  )
}
