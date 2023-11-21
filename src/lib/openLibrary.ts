import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { fetchJson } from "lib/helpers/general"
import type Book from "types/Book"

dayjs.extend(customParseFormat)

const PUBLISH_DATE_FORMATS = ["YYYY", "MMMM YYYY", "MMMM D, YYYY", "MMM D, YYYY", "YYYY-MM-DD"]

const BASE_URL = "https://openlibrary.org"
const COVERS_BASE_URL = "https://covers.openlibrary.org/b"
const PATHS = {
  search: "search.json",
}

enum CoverUrlType {
  CoverId = "id",
}

enum CoverSize {
  S = "S",
  M = "M",
  L = "L",
}

const OpenLibrary = {
  getFullBook: async (workId: string) => {
    // get work
    const workUrl = `${BASE_URL}/works/${workId}.json`
    const work = await fetchJson(workUrl)

    // get editions and first book data
    const editionsUrl = `${BASE_URL}/works/${workId}/editions.json`
    const editionsRes = await fetchJson(editionsUrl)
    const _editions = editionsRes.entries
    const editions = [..._editions].sort((a, b) => {
      if (!a.latestRevision) return 1
      if (!b.latestRevision) return -1
      return b.latestRevision - a.latestRevision
    })

    const isEnglishEdition = (e) =>
      e.languages && e.languages.length === 1 && e.languages[0].key === "/languages/eng"

    const bestEdition = editions.filter(
      (e) => isEnglishEdition(e) || !e.languages || e.languages.length === 0,
    )[0]

    // determine whether original language is english
    const bestEnglishEdition = editions.find((e) => isEnglishEdition(e))

    const normalizeString = (str) => {
      let result = str
      const stringsToRemove = ["& ", "and "]

      stringsToRemove.forEach((toRemove) => {
        result = result.replace(new RegExp(toRemove, "g"), "")
      })

      return result
    }

    const isSameLanguage = (_a, _b) => {
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

    const isTranslated =
      !!bestEnglishEdition && !isSameLanguage(work.title, bestEnglishEdition.title)

    // get author from work
    let authorName
    const authorKey = work.authors?.[0]?.author?.key

    if (authorKey) {
      let authorUrl = `${BASE_URL}/${authorKey}.json`
      let author = await fetchJson(authorUrl)
      console.log(author)
      if (author.type.key === "/type/redirect") {
        const nextAuthorKey = author.location
        authorUrl = `${BASE_URL}/${nextAuthorKey}.json`
        author = await fetchJson(authorUrl)
      }
      authorName = isTranslated ? author.personalName || author.name : author.name
    }

    const getCoverUrl = (coverId: string) =>
      OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, CoverSize.L)

    let coverImageUrl

    // first work cover
    if (work && work.covers && work.covers.length > 0) {
      coverImageUrl = getCoverUrl(work.covers[0])
    }

    // if no work cover, fall back to best edition that has a cover
    if (!coverImageUrl) {
      const bestEditionWithCover = editions.find(
        (edition: any) => edition.covers && edition.covers.length > 0,
      )

      if (bestEditionWithCover) {
        coverImageUrl = getCoverUrl(bestEditionWithCover.covers[0])
      }
    }

    if (isTranslated) {
      // best english edition cover wins over any other cover
      const bestEnglishEditionWithCover = editions.find(
        (e) => isEnglishEdition(e) && e.covers && e.covers.length > 0,
      )
      if (bestEnglishEditionWithCover) {
        coverImageUrl = getCoverUrl(bestEnglishEditionWithCover.covers[0])
      }
    }

    // polyfill schema inconsistencies
    const description = work.description?.value || work.description || "No description found."

    const getFirstPublishedYear = () => {
      const pubYears = editions
        .map((e) => {
          const dayjsDate = dayjs(e.publishDate, PUBLISH_DATE_FORMATS)
          if (!dayjsDate.isValid()) return null
          return dayjsDate.year()
        })
        .filter((year) => !!year)

      return Math.min(...(pubYears as number[]))
    }

    const book: Book = {
      title: isTranslated ? bestEnglishEdition.title : work.title,
      subtitle: isTranslated
        ? bestEnglishEdition.subtitle || work.subtitle || bestEdition.subtitle
        : work.subtitle || bestEnglishEdition?.subtitle,
      authorName,
      description,
      coverImageUrl: coverImageUrl!,
      editionsCount: editionsRes.size,
      firstPublishedYear: getFirstPublishedYear(),
      openLibraryWorkId: workId,
      isTranslated,
      originalTitle: work.title,
    }

    return book
  },

  getOlWorkPageUrl: (workId: string) => `${BASE_URL}/works/${workId}`,

  getCoverUrl: (coverUrlType: CoverUrlType, id: string | number, size: CoverSize) =>
    `${COVERS_BASE_URL}/${coverUrlType}/${id}-${size}.jpg`,

  sortedEditionsByPubDate: (editions) =>
    [...editions].sort((editionA, editionB) => {
      const pubDateA = dayjs(editionA.publishDate, PUBLISH_DATE_FORMATS)
      const pubDateB = dayjs(editionB.publishDate, PUBLISH_DATE_FORMATS)
      return pubDateA.isAfter(pubDateB) ? 1 : -1
    }),

  search: async (searchString: string, limit: number = 3) => {
    const baseSearchUrl = `${BASE_URL}/${PATHS.search}`
    const url = new URL(baseSearchUrl)
    url.searchParams.append("q", searchString)

    const resBody = await fetchJson(url)
    let results = resBody.docs // returns up to 100 results per page
    let moreResultsExist = resBody.numFound > results.length

    const books: Partial<Book>[] = []

    // filter out unreliable results and apply limit
    // so far some markers of unreliable results (based on trial and error) include:
    // + no isbn
    // + no author name
    // + listed as independently published
    results = results.filter(
      (result: any) => result.isbn && result.authorName && result.authorName.length > 0,
    )

    // TODO: deprioritize instead of excluding
    // results = results.filter(
    //   (result: any) => !result.publisher?.includes("Independently Published"),
    // )

    // there are more pages of results in openlibrary OR
    // there are more filtered results than the limit
    moreResultsExist = moreResultsExist || results.length > limit
    results = results.slice(0, limit)

    results.forEach((result: any) => {
      const { title, coverI: coverId } = result
      const author = result.authorName?.join(", ")
      const openLibraryWorkId = result.key.split("/works/").pop()

      const isDup = books.some((book) => book.title === title && book.authorName === author)
      if (isDup) return

      const book: Book = {
        title,
        authorName: author,
        openLibraryWorkId,
        coverImageUrl:
          coverId && OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, CoverSize.M),
        editionsCount: result.editionCount,
        firstPublishedYear: result.firstPublishYear,
      }

      books.push(book)
    })

    return { resultsForPage: books, moreResultsExist }
  },
}

export default OpenLibrary
