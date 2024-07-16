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
  getDomainFromUrl,
} from "lib/helpers/general"
import ListBook from "app/lists/components/ListBook"
import ExpandableText from "app/components/ExpandableText"
import EmptyState from "app/components/EmptyState"
import { personBookRelationTypeCopy } from "enums/PersonBookRelationType"

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
    authoredBooks: allAuthoredBooks = [],
    wikipediaUrl,
    location,
    website,
    instagram,
    tiktok,
    bluesky,
    twitter,
    linkedin,
    creditsByRelationType: credits = [],
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
    <div className="mt-8 max-w-5xl mx-8 lg:mx-auto">
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
            <div className="block lg:hidden">
              <div className="">{title}</div>
              <div className="">{orgName}</div>
            </div>
            <div className="hidden lg:block">
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
      <div className="lg:flex lg:justify-between">
        <div className="flex-grow-0 flex-shrink-0 w-full lg:w-64 mb-16 lg:mb-8">
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

        <div className="mx-auto lg:ml-16 lg:mr-0 xs:w-[400px] sm:w-[600px] lg:w-[640px]">
          {authoredBooks.length > 0 || credits.length > 0 ? (
            <>
              {authoredBooks.length > 0 && (
                <div>
                  <h2 className="cat-eyebrow">author</h2>
                  <hr className="mt-0.5 h-[1px] border-none bg-gray-300" />

                  {!person.areBooksEdited && (
                    <div className="mt-4 lg:mb-2 text-gray-300 italic">
                      The most notable books by {name}, populated from OpenLibrary.
                    </div>
                  )}

                  <div className="grid grid-cols-4 sm:gap-[28px]">
                    {authoredBooks.map((book) => (
                      <ListBook key={book.openLibraryWorkId} book={book} />
                    ))}
                  </div>
                </div>
              )}

              {credits.length > 0 && (
                <div className="">
                  {credits.map(({ relationType, relations }) => {
                    if (!relations || relations.length === 0) return null

                    return (
                      <div key={relationType} className="my-6">
                        <div className="cat-eyebrow">
                          {personBookRelationTypeCopy[relationType]}
                        </div>
                        <hr className="mt-0.5 h-[1px] border-none bg-gray-300" />

                        <div className="p-0 grid grid-cols-4 sm:gap-[28px]">
                          {relations.map((relation) => (
                            <ListBook
                              key={relation.id}
                              book={relation.book}
                              detail={relation.detail}
                            />
                          ))}
                        </div>
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
