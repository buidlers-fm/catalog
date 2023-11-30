import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { fetchJson, isSameLanguage } from "lib/helpers/general"
import type Book from "types/Book"

dayjs.extend(customParseFormat)

const OL_LANGUAGE_CODE = "en"
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
  getFullBook: async (workId: string, bestEditionId?) => {
    // get work
    const workUrl = `${BASE_URL}/works/${workId}.json`
    const work = await fetchJson(workUrl)

    let bestEdition

    if (bestEditionId) {
      const editionUrl = `${BASE_URL}/editions/${bestEditionId}.json`
      try {
        bestEdition = await fetchJson(editionUrl)
      } catch (error: any) {
        console.error(error)
      }
    }

    // get editions and first book data
    const editionsUrl = `${BASE_URL}/works/${workId}/editions.json`
    const editionsRes = await fetchJson(editionsUrl)
    const _editions = editionsRes.entries
    let editions = [..._editions].sort((a, b) => {
      if (!a.latestRevision) return 1
      if (!b.latestRevision) return -1
      return b.latestRevision - a.latestRevision
    })

    const isEnglishEdition = (e) =>
      e.languages && e.languages.length === 1 && e.languages[0].key === "/languages/eng"

    if (bestEdition) {
      // make it first in the array
      const rest = editions.filter((e) => e.key !== bestEdition.key)
      editions = [bestEdition, ...rest]
    } else {
      ;[bestEdition] = editions.filter(
        (e) => isEnglishEdition(e) || !e.languages || e.languages.length === 0,
      )
    }

    // determine whether original language is english
    const bestEnglishEdition = editions.find((e) => isEnglishEdition(e))

    const isTranslated =
      !!bestEnglishEdition && !isSameLanguage(work.title, bestEnglishEdition.title)

    // get author from work
    let authorName
    const authorKey = work.authors?.[0]?.author?.key

    if (authorKey) {
      let authorUrl = `${BASE_URL}/${authorKey}.json`
      let author = await fetchJson(authorUrl)
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

  search: async (searchString: string, { includeEditions = false, limit = 3 }) => {
    let searchFields = [
      "key",
      "title",
      "author_name",
      "cover_i",
      "edition_count",
      "first_publish_year",
      "isbn",
    ]

    if (includeEditions) {
      searchFields = [...searchFields, "editions", "editions.*"]
    }

    const baseSearchUrl = `${BASE_URL}/${PATHS.search}`
    const url = new URL(baseSearchUrl)
    url.searchParams.append("q", searchString)
    url.searchParams.append("lang", OL_LANGUAGE_CODE)
    url.searchParams.append("fields", searchFields.join(","))

    const resBody = await fetchJson(url)
    let results = resBody.docs // returns up to 100 results per page
    let moreResultsExist = resBody.numFound > results.length

    // filter out unreliable results and apply limit
    // so far some markers of unreliable results (based on trial and error) include:
    // + no isbn
    // + no author name
    results = results.filter(
      (result: any) => result.isbn && result.authorName && result.authorName.length > 0,
    )

    const resultsByEditionCount = [...results].sort((a, b) => b.editionCount - a.editionCount)

    const resultsByFirstPublished = [...results].sort(
      (a, b) => (a.firstPublishYear || Infinity) - (b.firstPublishYear || Infinity),
    )

    const decoratedResults = results.map((result, idx) => ({
      result,
      originalIndex: idx,
      editionCountIndex: resultsByEditionCount.findIndex((r) => r.key === result.key),
      firstPublishedIndex: resultsByFirstPublished.findIndex((r) => r.key === result.key),
    }))

    const scoreForResult = (decoratedResult) => {
      const { originalIndex, editionCountIndex, firstPublishedIndex } = decoratedResult

      // avoid 0 values in case we use multipliers at some point
      const originalIndexScore = originalIndex + 1
      const editionCountScore = editionCountIndex + 1
      const firstPublishedScore = firstPublishedIndex + 1

      const totalScore = originalIndexScore + editionCountScore + firstPublishedScore

      return totalScore
    }

    const rankedResults = [...decoratedResults]
      .sort((a, b) => scoreForResult(a) - scoreForResult(b))
      .map((decoratedResult) => decoratedResult.result)

    // there are more pages of results in openlibrary OR
    // there are more filtered results than the limit
    moreResultsExist = moreResultsExist || results.length > limit
    const finalResults = rankedResults.slice(0, limit)

    const books: Partial<Book>[] = []

    finalResults.forEach((result: any) => {
      const {
        title: workTitle,
        coverI: workCoverId,
        editionCount: editionsCount,
        firstPublishYear: firstPublishedYear,
        editions,
      } = result
      const bestEdition = editions?.docs?.[0]
      const bestEditionCoverId = bestEdition?.coverI

      const isTranslated = !!bestEdition && !isSameLanguage(bestEdition.title, workTitle)

      const title = bestEdition?.title || workTitle
      const authorName = result.authorName?.join(", ")
      const coverId = isTranslated && !!bestEditionCoverId ? bestEditionCoverId : workCoverId
      const coverImageUrl =
        coverId && OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, CoverSize.M)
      const openLibraryWorkId = result.key.split("/works/").pop()
      const openLibraryBestEditionId = bestEdition
        ? bestEdition.key.split("/books/").pop()
        : undefined

      const isDup = books.some((book) => book.title === title && book.authorName === authorName)
      if (isDup) return

      const book: Book = {
        title,
        authorName,
        coverImageUrl,
        editionsCount,
        firstPublishedYear,
        openLibraryWorkId,
        openLibraryBestEditionId,
      }

      books.push(book)
    })

    return { resultsForPage: books, moreResultsExist }
  },
}

export default OpenLibrary
