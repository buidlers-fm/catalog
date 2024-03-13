import Link from "next/link"
import { GiOpenBook } from "react-icons/gi"
import { FaComment } from "react-icons/fa"
import { truncateString } from "lib/helpers/strings"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"
import Likes from "app/components/Likes"
import SaveBookmark from "app/components/saves/SaveBookmark"
import InteractionObjectType from "enums/InteractionObjectType"

const NUM_BOOK_COVERS = 4

type Props = {
  list: any
  withByline?: boolean
  separators?: boolean
  compact?: boolean
  currentUserProfile?: any
  onSaveUnsave?: () => void
}

export default function ListCard({
  list,
  withByline = false,
  separators = true,
  compact = false,
  currentUserProfile,
  onSaveUnsave,
}: Props) {
  const totalBookCount = list.books.length
  const { likeCount, save, id: listId } = list
  const books = list.books.slice(0, NUM_BOOK_COVERS)

  return (
    <div
      className={`${compact ? null : "py-6"} ${
        separators && "border-b border-b-gray-500 last:border-none"
      }`}
    >
      <div className="sm:flex items-center">
        <Link href={list.url}>
          <div className="w-[208px] flex shrink-0 mr-4 relative z-0">
            {books.map((book, idx) => (
              <ListCardBook key={book.id} book={book} idx={idx} />
            ))}
          </div>
        </Link>
        <div className="mt-4 sm:mt-2 sm:mx-4 grow font-mulish">
          <div className="mt-[-8px]">
            <Link href={list.url}>
              <div className="font-bold">{truncateString(list.title, 64)}</div>
            </Link>
            <div className="flex items-center my-1">
              <div className="mr-3 text-gray-500 text-sm font-normal">
                {totalBookCount} {totalBookCount === 1 ? "book" : "books"}
              </div>
              <Likes
                interactive={false}
                likedObject={list}
                likedObjectType={InteractionObjectType.List}
                likeCount={likeCount}
              />
              <div className="flex items-center ml-4">
                <FaComment className="mr-1.5 text-gray-500 text-md" />
                {list.comments && (
                  <span className="text-sm text-gray-300 font-mulish">{list.comments.length}</span>
                )}
              </div>
              {currentUserProfile && (
                <div className="ml-4">
                  <SaveBookmark
                    savedObjectType={InteractionObjectType.List}
                    savedObjectId={listId}
                    saveId={save?.id}
                    onSaveUnsave={onSaveUnsave}
                  />
                </div>
              )}
            </div>
          </div>
          {withByline && <NameWithAvatar userProfile={list.owner} />}
          {list.description && (
            <div className="text-sm">{truncateString(list.description, 100)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function ListCardBook({ book, idx }) {
  const zIndexes = ["z-40", "z-30", "z-20", "z-10"]
  const zIndex = zIndexes[idx]

  return (
    <div className={`-mr-[16px] w-[64px] h-[96px] overflow-hidden ${zIndex}`}>
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          className="h-full object-cover rounded-sm"
          alt={`${book.title} cover`}
        />
      ) : (
        <div className="w-full h-full shrink-0 flex items-center justify-center bg-black border-2 border-gray-500 box-border rounded">
          <GiOpenBook className="mt-0 text-2xl text-gray-500" />
        </div>
      )}
    </div>
  )
}
