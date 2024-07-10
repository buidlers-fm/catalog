"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { BsLink45Deg } from "react-icons/bs"
import { FaUserCircle } from "react-icons/fa"
import { FaInstagram, FaTiktok, FaBluesky, FaXTwitter, FaLinkedin } from "react-icons/fa6"
import { MdEdit } from "react-icons/md"
import { PiMapPinFill } from "react-icons/pi"
import { TbExternalLink } from "react-icons/tb"
import {
  getPersonEditLink,
  getPersonEditLinkWithQueryString,
  getBookLinkAgnostic,
  getDomainFromUrl,
} from "lib/helpers/general"
import CoverPlaceholder from "app/components/books/CoverPlaceholder"
import BookCoverOverlay from "app/components/books/BookCoverOverlay"
import BookTooltip from "app/components/books/BookTooltip"
import ExpandableText from "app/components/ExpandableText"
import EmptyState from "app/components/EmptyState"
import { personBookRelationTypeCopy } from "enums/PersonBookRelationType"
import type Book from "types/Book"

const BOOKS_LIMIT = 8

export default function PersonPage({ person }) {
  const searchParams = useSearchParams()

  const {
    slug,
    openLibraryAuthorId,
    name,
    orgName,
    title,
    bio,
    imageUrl,
    authoredBooks: allAuthoredBooks,
    wikipediaUrl,
    location,
    website,
    instagram,
    tiktok,
    bluesky,
    twitter,
    linkedin,
    creditsByRelationType: credits,
  } = person

  const openLibraryUrl = `https://openlibrary.org/authors/${openLibraryAuthorId}`

  const bioPlaceholder = "No bio available."

  const instagramUrl = instagram ? `https://instagram.com/${instagram}` : null
  const tiktokUrl = tiktok ? `https://tiktok.com/@${tiktok}` : null
  const blueskyUrl = bluesky ? `https://bsky.app/profile/${bluesky}` : null
  const twitterUrl = twitter ? `https://x.com/${twitter}` : null
  const linkedinUrl = linkedin ? `https://linkedin.com/in/${linkedin}` : null

  let authoredBooks

  if (person.areBooksEdited) {
    authoredBooks = allAuthoredBooks.sort((a, b) => {
      // by first published year, descending
      if (a.firstPublishedYear === undefined) return 1
      if (b.firstPublishedYear === undefined) return -1
      return b.firstPublishedYear - a.firstPublishedYear
    })
  } else {
    authoredBooks = allAuthoredBooks.slice(0, BOOKS_LIMIT)
  }

  return (
    <div className="mt-8 max-w-4xl mx-8 lg:mx-auto">
      <div className="sm:flex font-mulish mb-8 pb-8 border-b border-b-gray-500">
        {imageUrl ? (
          <div className="shrink-0 sm:mr-4 w-36 h-36 overflow-hidden rounded-full">
            <img src={imageUrl} alt={name} className="object-cover min-w-full min-h-full" />
          </div>
        ) : (
          <FaUserCircle className="mr-3 text-[144px] text-gray-500" />
        )}
        <div className="my-6 sm:my-0 sm:ml-4 grow">
          <div className="text-2xl font-bold">
            <span data-intro-tour="profile-page">{name}</span>
          </div>

          <div className="mt-1 text-gray-300">
            <div className="block md:hidden">
              <div className="">{title}</div>
              <div className="">{orgName}</div>
            </div>
            <div className="hidden md:block">
              {title}
              {title && orgName && " • "}
              {orgName}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row mt-3 text-gray-300">
            {location && (
              <div className="mr-4">
                <PiMapPinFill className="inline-block -mt-[5px] mr-1" />
                {location}
              </div>
            )}
            {website && (
              <div className="my-1 sm:my-0">
                <BsLink45Deg className="inline-block -mt-[3px] mr-1 text-lg " />
                <Link href={website} target="_blank" rel="noopener noreferrer">
                  {getDomainFromUrl(website)}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center my-4">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="mr-4">
                <FaInstagram className="text-2xl" />
              </a>
            )}
            {tiktokUrl && (
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="mr-4">
                <FaTiktok className="text-xl" />
              </a>
            )}
            {blueskyUrl && (
              <a href={blueskyUrl} target="_blank" rel="noopener noreferrer" className="mr-4">
                <FaBluesky className="text-xl" />
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="mr-4">
                <FaXTwitter className="text-xl" />
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="mr-4">
                <FaLinkedin className="text-2xl" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="md:flex">
        <div className="flex-grow-0 flex-shrink-0 w-full md:w-64 mb-16 md:mb-8 pb-8 md:pb-0 border-b border-b-gray-500 md:border-none">
          {bio ? (
            <div className="mb-4">
              <ExpandableText text={bio} />
            </div>
          ) : (
            <div className="mb-4 text-gray-300 italic">{bioPlaceholder}</div>
          )}

          <div className="my-1">
            <Link
              href={openLibraryUrl}
              className="cat-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenLibrary
            </Link>
            <TbExternalLink className="ml-1 -mt-1 inline-block" />
          </div>

          {wikipediaUrl && (
            <div className="my-1">
              <Link
                href={wikipediaUrl}
                className="cat-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wikipedia
              </Link>
              <TbExternalLink className="ml-1 -mt-1 inline-block" />
            </div>
          )}

          <div className="">
            <Link
              href={
                slug
                  ? getPersonEditLink(slug)
                  : getPersonEditLinkWithQueryString(searchParams.toString())
              }
              className="mt-4 mb-2 block text-sm text-gray-200 hover:text-white font-mulish"
            >
              <MdEdit className="inline-block -mt-[4px] text-sm" /> edit this person
            </Link>
          </div>
        </div>

        <div className="flex-grow mx-auto md:ml-16">
          {authoredBooks.length > 0 || credits.length > 0 ? (
            <>
              {authoredBooks.length > 0 && (
                <div>
                  <h2 className="cat-eyebrow">author</h2>
                  <hr className="mt-0.5 h-[1px] border-none bg-gray-300" />
                  {authoredBooks.map((book) => (
                    <BookCard key={book.openLibraryWorkId} book={book} />
                  ))}
                </div>
              )}

              {credits.length > 0 && (
                <div className="font-mulish">
                  {credits.map(({ relationType, relations }) => {
                    if (!relations || relations.length === 0) return null

                    return (
                      <div key={relationType} className="my-6">
                        <div className="cat-eyebrow">
                          {personBookRelationTypeCopy[relationType]}
                        </div>
                        <hr className="mt-0.5 h-[1px] border-none bg-gray-300" />

                        {relations.map((relation) => (
                          <div key={relation.id} className="my-2">
                            <BookCard book={relation.book} relationDetail={relation.detail} />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <EmptyState text={`No books found for ${name}.`} />
          )}
        </div>
      </div>
    </div>
  )
}

function BookCard({ book, relationDetail }: { book: Book; relationDetail?: string }) {
  const { id, openLibraryWorkId, coverImageUrl, title, editionsCount, firstPublishedYear } = book

  const idForAnchor = id || openLibraryWorkId

  return (
    <div className="px-2 py-4 border-b-[1px] border-b-gray-800 last:border-none">
      <div className="flex">
        <div id={`book-${idForAnchor}`} className="w-16 mr-6 shrink-0">
          <div className="relative group">
            <Link href={getBookLinkAgnostic(book)}>
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
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

        <BookTooltip book={book} anchorSelect={`#book-${idForAnchor}`} />

        <div className="grow flex flex-col justify-between">
          <div className="">
            <Link href={getBookLinkAgnostic(book)}>{title}</Link>
            <div className="text-gray-300">
              {editionsCount} editions • {firstPublishedYear}
            </div>
          </div>

          {relationDetail && <div className="text-gray-300">{relationDetail}</div>}
        </div>
      </div>
    </div>
  )
}
