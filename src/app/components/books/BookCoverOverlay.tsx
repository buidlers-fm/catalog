import { useState, useEffect } from "react"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import toast from "react-hot-toast"
import { reportToSentry } from "lib/sentry"
import { useUser } from "lib/contexts/UserContext"
import { useUserBooks } from "lib/contexts/UserBooksContext"
import UserBookShelfMenu from "app/components/userBookShelves/UserBookShelfMenu"
import BookCoverOverlayMenu from "app/components/books/BookCoverOverlayMenu"
import type Book from "types/Book"

export default function BookCoverOverlay({
  book,
  positionClass = "bottom-1",
}: {
  book: Book
  positionClass?: string
}) {
  const { currentUserProfile } = useUser()
  const { bookIdsToLiked, likeBook, unlikeBook } = useUserBooks()

  const [isLiked, setIsLiked] = useState<boolean>(!!bookIdsToLiked[book.id!])

  useEffect(() => {
    setIsLiked(!!bookIdsToLiked[book.id!])
  }, [bookIdsToLiked, book.id])

  async function toggleLike() {
    // optimistic updates
    try {
      if (isLiked) {
        setIsLiked(false)

        try {
          await unlikeBook(book)
        } catch (error: any) {
          setIsLiked(true)
          throw error
        }
      } else {
        setIsLiked(true)

        try {
          await likeBook(book)
        } catch (error: any) {
          setIsLiked(false)
          throw error
        }
      }
    } catch (error: any) {
      reportToSentry(error, {
        method: "toggleLike",
        toggleTo: !isLiked,
        book,
        currentUserProfile,
      })

      toast.error("Hmm, something went wrong.")
    }
  }

  if (!currentUserProfile) return null

  return (
    <div
      className={`hidden group-hover:flex group-hover:z-50 absolute left-1/2 transform -translate-x-1/2 ${positionClass} p-2 bg-black bg-opacity-80 items-center justify-center`}
    >
      <button className="mr-1" onClick={toggleLike}>
        {isLiked ? <FaHeart className="text-red-300" /> : <FaRegHeart className="text-gray-500" />}
      </button>
      <div className="mx-1">
        <UserBookShelfMenu book={book} compact />
      </div>
      <div className="ml-0.5 -mr-0.5">
        <BookCoverOverlayMenu book={book} />
      </div>
    </div>
  )
}
