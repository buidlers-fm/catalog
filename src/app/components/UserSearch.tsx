"use client"

import { useState, useMemo, Fragment } from "react"
import { Combobox } from "@headlessui/react"
import { ThreeDotsScale } from "react-svg-spinners"
import debounce from "lodash.debounce"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"

const DEBOUNCE_THRESHOLD_MS = 500

type Props = {
  followersOnly?: boolean
  onSelect: (item: any) => any
  disabled?: boolean
  disabledMessage?: string
  maxHeightClass?: string
}

export default function UserSearch({
  followersOnly = false,
  onSelect,
  disabled = false,
  disabledMessage,
  maxHeightClass = "max-h-[calc(100vh-192px)]",
}: Props) {
  const [searchResults, setSearchResults] = useState<any[]>()
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<any | null>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const debouncedSearchHandler = useMemo(() => {
    async function onSearchChange(e: any) {
      setErrorMessage(undefined)

      const searchString = e.target.value

      if (searchString.length === 0) {
        setSearchResults(undefined)
        return
      }

      await searchUsers(searchString)
      setIsSearching(false)
    }

    return debounce(onSearchChange, DEBOUNCE_THRESHOLD_MS)
  }, [])

  const searchUsers = async (searchString: string) => {
    setErrorMessage(undefined)
    setIsSearching(true)

    try {
      const results = await api.profiles.search(searchString, followersOnly)
      setSearchResults(results)
    } catch (error: any) {
      setErrorMessage("There was an error searching users.")
      reportToSentry(error, { searchString })
    }
  }

  const handleSelect = (_selectedUser) => {
    setSelectedUser(_selectedUser)
    if (onSelect) onSelect(_selectedUser)
  }

  const isLoadingUsers = (isSearching && !searchResults) || !!selectedUser

  return (
    <div className="relative">
      {disabled ? (
        <div>{disabledMessage}</div>
      ) : (
        <>
          <Combobox value={undefined} onChange={handleSelect}>
            {({ open }) => (
              <>
                <Combobox.Input
                  onChange={debouncedSearchHandler}
                  displayValue={() => {
                    const name = selectedUser?.displayName || selectedUser?.username
                    return name || ""
                  }}
                  placeholder="start typing a user's name..."
                  className="w-full px-4 pt-2.5 pb-2 bg-gray-900 focus:outline-gold-500 rounded border-none font-mulish"
                />
                {(open || selectedUser) && (
                  <Combobox.Options
                    static
                    className="w-full absolute z-50 top-[50px] rounded bg-gray-900 font-mulish"
                  >
                    <UserSearchResults
                      isLoading={isLoadingUsers}
                      searchResults={searchResults}
                      maxHeightClass={maxHeightClass}
                      errorMessage={errorMessage}
                    />
                  </Combobox.Options>
                )}
              </>
            )}
          </Combobox>

          <div className="mt-1 text-gray-300 text-sm">
            You can only recommend a book to someone who follows you.
          </div>
        </>
      )}
    </div>
  )
}

function UserSearchResults({ isLoading, searchResults, maxHeightClass, errorMessage }) {
  return (
    <>
      {isLoading && (
        <div className="h-20 flex items-center justify-center">
          {/* spinner is teal-300  */}
          <ThreeDotsScale width={32} height={32} color="hsl(181, 43%, 60%)" />
        </div>
      )}

      {errorMessage && <div className="px-6 py-3">{errorMessage}</div>}

      {!isLoading && searchResults && searchResults.length === 0 && (
        <div className="px-6 py-3">No users found.</div>
      )}

      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className={`${maxHeightClass} overflow-y-auto`}>
          {searchResults.map((userProfile) => (
            <Combobox.Option key={userProfile.id} value={userProfile} as={Fragment}>
              {({ active }) => (
                <li
                  className={`flex items-center ${
                    active && "bg-gray-700"
                  } px-4 py-1 cursor-pointer border-b border-b-gray-700 last:border-none`}
                >
                  <NameWithAvatar userProfile={userProfile} large bothNames link={false} />
                </li>
              )}
            </Combobox.Option>
          ))}
        </div>
      )}
    </>
  )
}
