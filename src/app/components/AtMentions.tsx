import { useState } from "react"
import { MentionsInput, Mention } from "react-mentions"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { idsToObjects } from "lib/helpers/general"
import UserProfile from "lib/models/UserProfile"
import NameWithAvatar from "app/components/userProfiles/NameWithAvatar"

const LIMIT = 4

const bgColorToValue = {
  "bg-gray-700": "hsl(45, 8%, 37%)",
  "bg-gray-800": "hsl(45, 8%, 29%)",
  "bg-gray-900": "hsl(45, 8%, 22%)",
}

export default function AtMentions({ bgColor, formProps, moreProps, name, rows }) {
  const [searchResultsMap, setSearchResultsMap] = useState<any>({})

  const height = `${rows * 2}rem`

  const mentionsInputStyles = {
    control: {
      boxSizing: "border-box",
      width: "100%",
      maxWidth: "100%",
      backgroundColor: bgColorToValue[bgColor],
      height,
      overflowY: "auto",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.5rem",
      marginBottom: "0.25rem",
    },
    input: {
      boxSizing: "border-box",
      backgroundColor: bgColorToValue[bgColor],
      width: "100%",
      maxWidth: "100%",
      overflowY: "auto",
      height,
      borderRadius: "0.25rem",
      border: "none",
      marginBottom: "0.25rem",
    },
    suggestions: {
      list: {
        backgroundColor: bgColorToValue["bg-gray-900"],
        borderRadius: "0.25rem",
      },
    },
  }

  async function searchUsers(searchString, callback) {
    let results
    try {
      results = await api.profiles.search(searchString)
    } catch (error: any) {
      reportToSentry(error, { searchString, method: "atMentionSearch" })
    }

    results = results.slice(0, LIMIT)
    results = results.map((result) => ({
      ...result,
      display: UserProfile.build(result).name,
    }))

    const mappedResults = idsToObjects(results)
    const allMappedResults = { ...searchResultsMap, ...mappedResults }
    setSearchResultsMap(allMappedResults)

    callback(results)
  }

  const renderResult = (suggestion, search, highlightedDisplay, index, focused) => (
    <div
      className={`flex items-center ${
        focused && "bg-gray-700"
      } px-4 py-1 cursor-pointer border-b border-b-gray-700 last:border-none`}
    >
      <NameWithAvatar userProfile={suggestion} bothNames inline />
    </div>
  )

  const resultsContainer = (children) => (
    <div className="w-full bg-gray-900 font-mulish">{children}</div>
  )

  const displayTransform = (id, display) => {
    const _userProfile = searchResultsMap[id]
    if (!_userProfile) return `@${display}`

    const userProfile = UserProfile.build(_userProfile)

    return `@${userProfile.name}`
  }

  return (
    <MentionsInput
      forceSuggestionsAboveCursor
      allowSpaceInQuery
      customSuggestionsContainer={resultsContainer}
      style={mentionsInputStyles}
      name={name}
      {...formProps}
      {...moreProps}
    >
      <Mention
        trigger="@"
        data={searchUsers}
        renderSuggestion={renderResult}
        displayTransform={displayTransform}
        markup="[@__display__](__id__)"
      />
    </MentionsInput>
  )
}
