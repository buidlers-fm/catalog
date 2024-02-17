import { useState, useEffect } from "react"
import { TbExternalLink, TbTrash } from "react-icons/tb"
import { MdEdit } from "react-icons/md"
import toast from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import EditAdaptation from "app/books/[bookSlug]/edit/components/EditAdaptation"
import ConfirmationModal from "app/components/ConfirmationModal"
import type Adaptation from "types/Adaptation"
import type Book from "types/Book"

type Props = {
  adaptation: Adaptation
  book?: Book
  onClickEdit?: () => void
  onEditSuccess?: () => void
  onDelete?: () => void
  compact?: boolean
}

export default function AdaptationCard({
  adaptation,
  book,
  onClickEdit,
  onEditSuccess,
  onDelete,
  compact = false,
}: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false)
  const [posterImageUrl, setPosterImageUrl] = useState<string>()

  const { id, title, type, year, dateString, tmdbUrl, letterboxdUrl, wikipediaUrl } = adaptation

  useEffect(() => {
    async function fetchTmdbData() {
      try {
        const tmdbMetadata = await api.openGraph.get(tmdbUrl)
        const { imageUrl } = tmdbMetadata
        if (imageUrl) setPosterImageUrl(imageUrl)
      } catch (error: any) {
        reportToSentry(error, { method: "AdaptationCard.fetchTmdbData", adaptation })
      }
    }

    if (tmdbUrl) fetchTmdbData()
  }, [adaptation, tmdbUrl])

  function handleClickEdit() {
    setIsEditing(true)
    if (onClickEdit) onClickEdit()
  }

  function handleEditSuccess() {
    setIsEditing(false)
    if (onEditSuccess) onEditSuccess()
  }

  async function handleDelete() {
    setIsBusy(true)

    const toastId = toast.loading("Deleting...")

    try {
      await api.adaptations.delete(id)

      toast.success(`Adaptation deleted!`, { id: toastId })

      if (onDelete) await onDelete()
    } catch (error: any) {
      reportToSentry(error, {
        method: "AdaptationCard.handleDelete",
        adaptation,
      })

      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsBusy(false)
  }

  return isEditing ? (
    <EditAdaptation
      adaptation={adaptation}
      book={book!}
      onSuccess={handleEditSuccess}
      onCancel={() => setIsEditing(false)}
    />
  ) : (
    <div className="py-4 flex space-x-8 border-b border-b-gray-500 first:border-t first:border-t-gray-500">
      {posterImageUrl && (
        <div className="shrink-0 flex items-center">
          <img src={posterImageUrl} alt={title} className="h-24 rounded" />
        </div>
      )}

      <div className="mt-2 xs:mt-0 flex flex-col justify-between">
        <div className="font-bold">
          {title}
          <div className="text-gray-300 text-sm">
            <span className="">{type === "tv" ? "TV series" : "Movie"}</span>
            {", "}
            <span className="">{dateString || year}</span>
          </div>
        </div>

        <div className={`mt-2 ${!compact && "sm:flex sm:space-x-4"} text-sm`}>
          {tmdbUrl && (
            <div className="my-1">
              <a href={tmdbUrl} className="cat-link" target="_blank" rel="noopener noreferrer">
                TMDB
              </a>
              <TbExternalLink className="ml-1 -mt-1 inline-block" />
            </div>
          )}

          {letterboxdUrl && (
            <div className="my-1">
              <a
                href={letterboxdUrl}
                className="cat-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Letterboxd
              </a>
              <TbExternalLink className="ml-1 -mt-1 inline-block" />
            </div>
          )}

          {wikipediaUrl && (
            <div className="my-1">
              <a href={wikipediaUrl} className="cat-link" target="_blank" rel="noopener noreferrer">
                Wikipedia
              </a>
              <TbExternalLink className="ml-1 -mt-1 inline-block" />
            </div>
          )}

          {(onEditSuccess || onDelete) && (
            <div className="flex items-center">
              {onEditSuccess && (
                <button disabled={isBusy} className="mt-1.5 mr-2" onClick={handleClickEdit}>
                  <MdEdit className="-mt-1 text-lg text-gray-300" />
                </button>
              )}
              {onDelete && (
                <button
                  disabled={isBusy}
                  className="mt-1"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  <TbTrash className="text-xl text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirmation && (
        <ConfirmationModal
          title="Delete this adaptation?"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirmation(false)}
          isOpen={showDeleteConfirmation}
        />
      )}
    </div>
  )
}
