import humps from "humps"

export const fetchJson = async (url: string | URL, options: any = {}) => {
  const res = await fetch(url)

  if (res.status !== 200) {
    console.log(res)
    const errorMessage = await res.text()
    throw new Error(errorMessage)
  }

  const resBody = await res.json()
  return humps.camelizeKeys(resBody)
}

export const truncateString = (str: string | undefined, maxChars: number) => {
  if (!str) return ""
  if (str.length <= maxChars) return str

  const lastSpaceIndex = str.lastIndexOf(" ", maxChars)
  const truncatedString = str.substring(0, lastSpaceIndex).trim()

  return `${truncatedString}...`
}
