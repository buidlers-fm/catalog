export function truncateString(_str: string | undefined, maxChars: number) {
  if (!_str) return ""

  // matches "[@foo](bar)"
  const atMentionPattern = /\[@([^\]]+)\]\((.*?)\)/g

  // replace all mentions with just the name
  let str = _str.replace(atMentionPattern, (match, p1) => `@${p1}`)

  // matches "[foo](bar)"
  const linkPattern = /\[([^\]]+)\]\((.*?)\)/g

  // replace all links with just the text
  str = str.replace(linkPattern, (match, p1) => p1)

  if (str.length <= maxChars) return str

  let boundaryIndex = str.lastIndexOf(" ", maxChars)

  if (boundaryIndex === -1) {
    boundaryIndex = maxChars
  }

  const truncatedString = str.substring(0, boundaryIndex).trim()

  return `${truncatedString}...`
}

export function normalizeString(str) {
  let result = str
  const stringsToRemove = ["& ", "and "]

  stringsToRemove.forEach((toRemove) => {
    result = result.replace(new RegExp(toRemove, "g"), "")
  })

  result = prepStringForSearch(result)

  return result
}

export function isSameLanguage(_a: string, _b: string) {
  const a = normalizeString(_a)
  const b = normalizeString(_b)
  return (
    a.localeCompare(b, undefined, {
      usage: "search",
      sensitivity: "base",
      ignorePunctuation: true,
    }) === 0
  )
}

export function stripPunctuation(str) {
  return str.replace(/[^\w\s]|_/g, "")
}

// identical implementations for now, but could diverge later
export const looseStringEquals = isSameLanguage

export function joinStringsWithAnd(strings) {
  const { length } = strings

  switch (length) {
    case 0:
      return ""
    case 1:
      return strings[0]
    case 2:
      return strings.join(" and ")
    default:
      return `${strings.slice(0, length - 1).join(", ")}, and ${strings[length - 1]}`
  }
}

export function stripArticles(_str: string) {
  let str = _str.toLowerCase().trim()

  const articles = ["a ", "an ", "the "]

  articles.forEach((article) => {
    if (str.startsWith(article)) {
      str = str.replace(article, "")
    }
  })

  return str
}

// for book search
export function prepStringForSearch(_str: string): string {
  if (!_str) return ""

  let str = _str.toLowerCase().trim()
  str = stripPunctuation(str)
  str = stripArticles(str)

  return str
}
