import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getBookLink } from "lib/helpers/general"
import { getFormattedTimestamps } from "lib/helpers/dateTime"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"
import CustomMarkdown from "app/components/CustomMarkdown"
import UserProfile from "lib/models/UserProfile"
import UserBookShelf from "enums/UserBookShelf"
import RecommendationStatus from "enums/RecommendationStatus"

export default function RecCard({ rec, onChange }) {
  const { shelveBook } = useUserBooks()

  const [isBusy, setIsBusy] = useState<boolean>(false)

  const { id, recommender: _recommender, book, note, status, createdAt } = rec

  const recommender = UserProfile.build(_recommender)

  const timestampTooltipAnchorId = `rec-created-at-${id}`

  let createdAtFromNow
  let timestampTooltip
  if (createdAt) {
    ;({ fromNow: createdAtFromNow, tooltip: timestampTooltip } = getFormattedTimestamps(
      createdAt,
      timestampTooltipAnchorId,
    ))
  }

  async function handleAccept() {
    setIsBusy(true)

    try {
      await shelveBook(book, UserBookShelf.ToRead)

      await api.recommendations.update(rec.id, { status: RecommendationStatus.Accepted })

      toast.success(`Added ${book.title} to your "to read" shelf!`)

      if (onChange) onChange()
    } catch (error: any) {
      toast.error("Hmm, something went wrong.")
      reportToSentry(error, {
        rec,
        method: "RecCard.handleAccept",
      })
    }

    setIsBusy(false)
  }

  async function handleDismiss() {
    setIsBusy(true)

    try {
      await api.recommendations.update(rec.id, { status: RecommendationStatus.Dismissed })

      if (onChange) onChange()
    } catch (error: any) {
      toast.error("Hmm, something went wrong.")
      reportToSentry(error, {
        rec,
        method: "RecCard.handleDismiss",
      })
    }

    setIsBusy(false)
  }

  return (
    <div className="p-4 border-b border-gray-300 last:border-none">
      <div className="flex">
        <div className="">
          <div id={`book-note-${id}`} className="w-16 mr-6 shrink-0">
            <div className="relative group">
              <Link href={getBookLink(book.slug)}>
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt="cover"
                    className="w-full mx-auto shadow-md rounded-xs"
                  />
                ) : (
                  <CoverPlaceholder size="sm" />
                )}
              </Link>

              <BookCoverOverlay book={book} positionClass="bottom-1" />
            </div>
          </div>

          <BookTooltip book={book} anchorSelect={`#book-note-${id}`} />
        </div>

        <div className="ml-2 grow">
          {recommender.name} recommended{" "}
          <Link href={getBookLink(book.slug)} className="cat-link">
            {book.title}
          </Link>{" "}
          by {book.authorName} to you.
          <span id={timestampTooltipAnchorId} className="ml-2 text-sm text-gray-500">
            {createdAtFromNow}
          </span>
          {timestampTooltip}
          {note && (
            <div className="ml-4 mt-4 mb-2 border-l-2 border-gray-500 px-3 font-newsreader">
              <CustomMarkdown markdown={note} />
            </div>
          )}
        </div>
      </div>

      {(status === RecommendationStatus.New || status === RecommendationStatus.Open) && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleAccept}
            disabled={isBusy}
            className="mr-2 cat-btn cat-btn-sm cat-btn-gold"
          >
            accept
          </button>
          <button
            onClick={handleDismiss}
            disabled={isBusy}
            className="cat-btn cat-btn-sm cat-btn-gray"
          >
            dismiss
          </button>
        </div>
      )}
    </div>
  )
}
