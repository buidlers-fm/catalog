import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { reportToSentry } from "lib/sentry"
import { fetchJson, isSameLanguage } from "lib/helpers/general"
import CoverSize from "enums/CoverSize"
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

enum OpenLibraryCoverSize {
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
      const bestEditionUrl = `${BASE_URL}/editions/${bestEditionId}.json`
      try {
        bestEdition = await fetchJson(bestEditionUrl)
      } catch (error: any) {
        reportToSentry(error, {
          workId,
          bestEditionId,
          work,
        })
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
      bestEdition = editions.find(
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
      OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, OpenLibraryCoverSize.L)

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
    const description = work.description?.value || work.description

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

  getCoverUrl: (coverUrlType: CoverUrlType, id: string | number, size: OpenLibraryCoverSize) =>
    `${COVERS_BASE_URL}/${coverUrlType}/${id}-${size}.jpg`,

  getCoverUrlsBySize: (imageUrl: string) => {
    const mPattern = /-M(\.\w+)$/ // filename ends in "-M", followed by file extension
    const lPattern = /-L(\.\w+)$/ // filename ends in "-L", followed by file extension
    let fileExtension

    if (imageUrl.match(mPattern)) {
      fileExtension = imageUrl.match(mPattern)![1]
    } else if (imageUrl.match(lPattern)) {
      fileExtension = imageUrl.match(lPattern)![1]
    } else {
      throw new Error("Image URL must include either -M or -L")
    }

    const imageUrlM = imageUrl.replace(lPattern, `-M${fileExtension}`)
    const imageUrlL = imageUrl.replace(mPattern, `-L${fileExtension}`)

    return {
      [CoverSize.Md]: imageUrlM,
      [CoverSize.Lg]: imageUrlL,
    }
  },

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

    // there are more pages of results in openlibrary OR
    // there are more filtered results than the limit
    moreResultsExist = moreResultsExist || results.length > limit

    const books = results.map((result: any) => {
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

      const title = isTranslated && bestEdition?.title ? bestEdition.title : workTitle
      const authorName = result.authorName?.join(", ")
      const coverId = isTranslated && !!bestEditionCoverId ? bestEditionCoverId : workCoverId
      const coverImageUrl =
        coverId && OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, OpenLibraryCoverSize.L)
      const coverImageThumbnailUrl =
        coverId && OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, OpenLibraryCoverSize.M)
      const openLibraryWorkId = result.key.split("/works/").pop()
      const openLibraryBestEditionId = bestEdition
        ? bestEdition.key.split("/books/").pop()
        : undefined

      const book: Book = {
        title,
        authorName,
        coverImageUrl,
        coverImageThumbnailUrl,
        openLibraryCoverImageUrl: coverImageUrl,
        editionsCount,
        firstPublishedYear,
        openLibraryWorkId,
        openLibraryBestEditionId,
        isTranslated,
        originalTitle: workTitle,
      }

      return book
    })

    return { resultsForPage: books, moreResultsExist }
  },
}

export default OpenLibrary
