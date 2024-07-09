"use client"

import Link from "next/link"
import { useState } from "react"
import { TbExternalLink } from "react-icons/tb"
import OpenLibrary from "lib/openLibrary"
import { getPersonLinkWithSlug } from "lib/helpers/general"
import ExpandableText from "app/components/ExpandableText"
import { personBookRelationTypeCopy } from "enums/PersonBookRelationType"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

enum Tab {
  Description = "description",
  Credits = "credits",
}

const DESCRIPTION_MAX_CHARS = 800
const DEFAULT_DESCRIPTION = "No description found."

export default function BookInfo({ book }) {
  const [currentTab, setCurrentTab] = useState(Tab.Description)

  const tabs = [Tab.Description, Tab.Credits]

  function isCurrentTab(tab) {
    return tab === currentTab
  }

  const description = book.description || DEFAULT_DESCRIPTION
  const { creditsByRelationType: credits } = book

  return (
    <div className="mt-8 mb-16">
      {credits && credits.length > 0 && (
        <div className="w-fit border-b border-gray-700 px-8 rounded-sm font-mulish">
          <nav className="-mb-px flex gap-x-8 sm:gap-x-16" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={classNames(
                  isCurrentTab(tab)
                    ? "border-gold-500"
                    : "border-transparent text-gray-500 hover:border-gray-300",
                  "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium",
                )}
                onClick={() => setCurrentTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      )}

      {isCurrentTab(Tab.Description) && (
        <div>
          <div className="mt-8 mb-4 md:w-11/12">
            <ExpandableText text={description} maxChars={DESCRIPTION_MAX_CHARS} />
          </div>

          {book.description && !book.edited && (
            <div className="px-8 flex justify-end text-sm text-gray-300">— from OpenLibrary</div>
          )}

          <div className="my-8">
            {book.openLibraryWorkId && (
              <div className="">
                <span className="text-gray-200">
                  {book.editionsCount
                    ? `${
                        book.editionsCount === 1 ? "1 edition" : `${book.editionsCount} editions`
                      } at`
                    : "More at"}
                </span>{" "}
                <Link
                  href={OpenLibrary.getOlWorkPageUrl(book.openLibraryWorkId)}
                  className="cat-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenLibrary
                </Link>
                <TbExternalLink className="ml-1 -mt-1 inline-block" />
              </div>
            )}

            {book.wikipediaUrl && (
              <div className="">
                <Link
                  href={book.wikipediaUrl}
                  className="cat-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </Link>
                <TbExternalLink className="ml-1 -mt-1 inline-block" />
              </div>
            )}
          </div>
        </div>
      )}

      {isCurrentTab(Tab.Credits) && (
        <div className="my-8 font-mulish">
          {credits.map(({ relationType, relations }) => {
            if (!relations || relations.length === 0) return null

            return (
              <div key={relationType} className="my-6">
                <div className="cat-eyebrow">{personBookRelationTypeCopy[relationType]}</div>
                <hr className="mt-0.5 h-[1px] border-none bg-gray-300" />

                {relations.map((relation) => (
                  <div key={relation.id} className="grid grid-cols-2 gap-x-2 my-2 text-sm">
                    {relation.detail ? (
                      <div className="float-left clear-left xs:leading-none xs:border-b xs:border-dotted xs:border-b-gray-300">
                        <span className="relative xs:top-1.5 pr-0.5 bg-black">
                          {relation.detail}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="">
                      <Link
                        href={getPersonLinkWithSlug(relation.person!.slug)}
                        className="cat-link relative xs:top-0.5"
                      >
                        {relation.person!.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
