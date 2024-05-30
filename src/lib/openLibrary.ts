import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import prisma from "lib/prisma"
import wikidata from "lib/wikidata"
import { reportToSentry } from "lib/sentry"
import { fetchJsonWithUserAgentHeaders } from "lib/helpers/general"
import { looseStringEquals, isSameLanguage, prepStringForSearch } from "lib/helpers/strings"
import CoverSize from "enums/CoverSize"
import type Book from "types/Book"

dayjs.extend(customParseFormat)

const OL_LANGUAGE_CODE = "en"
const PUBLISH_DATE_FORMATS = ["YYYY", "MMMM YYYY", "MMMM D, YYYY", "MMM D, YYYY", "YYYY-MM-DD"]

const BASE_URL = "https://openlibrary.org"
const COVERS_BASE_URL = "https://covers.openlibrary.org/b"
const AUTHOR_IMAGE_BASE_URL = "https://covers.openlibrary.org/a/id"
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
    const work = await fetchJsonWithUserAgentHeaders(workUrl)

    let bestEdition

    if (bestEditionId) {
      const bestEditionUrl = `${BASE_URL}/editions/${bestEditionId}.json`
      try {
        bestEdition = await fetchJsonWithUserAgentHeaders(bestEditionUrl)
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
    const editionsRes = await fetchJsonWithUserAgentHeaders(editionsUrl)
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
    let authorKey = work.authors?.[0]?.author?.key

    if (authorKey) {
      let authorUrl = `${BASE_URL}/${authorKey}.json`
      let author = await fetchJsonWithUserAgentHeaders(authorUrl)
      if (author.type.key === "/type/redirect") {
        authorKey = author.location
        authorUrl = `${BASE_URL}/${authorKey}.json`
        author = await fetchJsonWithUserAgentHeaders(authorUrl)
      }

      // get author name from wikipedia if possible
      let wikidataName
      const wikidataId = author.remoteIds?.wikidata
      if (wikidataId) {
        try {
          const wikidataRes = await wikidata.getItem(wikidataId, { compact: true })
          wikidataName = wikidataRes.name
        } catch (error: any) {
          reportToSentry(error, {
            method: "openLibrary.getFullBook.wikidata.getItem",
            author,
          })
        }
      }

      const openLibraryAuthorName = isTranslated ? author.personalName || author.name : author.name
      authorName = wikidataName || openLibraryAuthorName
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

    const isbn = editions
      .map((e) => [...(e.isbn13 || []), ...(e.isbn10 || [])])
      .flat()
      .filter(Boolean)[0]

    const oclc = editions
      .map((e) => e.oclcNumbers)
      .flat()
      .filter(Boolean)[0]

    const book: Book = {
      title: isTranslated ? bestEnglishEdition.title : work.title,
      subtitle: isTranslated
        ? bestEnglishEdition.subtitle || work.subtitle || bestEdition.subtitle
        : work.subtitle || bestEnglishEdition?.subtitle,
      authorName,
      openLibraryAuthorId: authorKey?.split("/authors/").pop(),
      description,
      coverImageUrl,
      openLibraryCoverImageUrl: coverImageUrl,
      editionsCount: editionsRes.size,
      firstPublishedYear: getFirstPublishedYear(),
      openLibraryWorkId: workId,
      isTranslated,
      originalTitle: work.title,
      isbn,
      oclc,
    }

    return book
  },

  // server-side only!
  getAuthor: async (authorId: string) => {
    const authorUrl = `${BASE_URL}/authors/${authorId}.json`
    const author = await fetchJsonWithUserAgentHeaders(authorUrl)

    const name = author.personalName || author.name
    const bio = author.bio?.value
    const photoId = author.photos?.[0]

    let photoUrl
    if (photoId) {
      photoUrl = OpenLibrary.getAuthorImageUrl(photoId, OpenLibraryCoverSize.M)
    }

    // get works from OL, and more author info from wikidata, in parallel
    const worksUrl = `${BASE_URL}/search.json?q=author_key:${authorId}`

    const worksPromise = fetchJsonWithUserAgentHeaders(worksUrl)
    const promises = [worksPromise]

    const wikidataId = author.remoteIds?.wikidata
    if (wikidataId) {
      const wikidataPromise = wikidata.getItem(wikidataId)
      promises.push(wikidataPromise)
    }

    const [worksRes, wikidataRes] = await Promise.all(promises)

    const { name: wikidataName, siteUrl: wikipediaUrl, summary: wikipediaBio } = wikidataRes || {}

    const authorName = wikidataName || name

    const worksEntries = worksRes.docs

    let books = worksEntries.map((workEntry: any) => {
      const coverId = workEntry.coverI
      let coverImageUrl
      if (coverId) {
        coverImageUrl = OpenLibrary.getCoverUrl(
          CoverUrlType.CoverId,
          coverId,
          OpenLibraryCoverSize.M,
        )
      }

      const openLibraryWorkId = workEntry.key?.split("/works/").pop()
      const firstPublishedYear = workEntry.firstPublishYear
      const editionsCount = workEntry.editionCount

      return {
        title: workEntry.title,
        authorName,
        coverImageUrl,
        openLibraryCoverImageUrl: coverImageUrl,
        openLibraryWorkId,
        firstPublishedYear,
        editionsCount,
      }
    })

    // fetch books from db
    const dbBooks = await prisma.book.findMany({
      where: {
        openLibraryWorkId: {
          in: books.map((b) => b.openLibraryWorkId),
          mode: "insensitive",
        },
      },
    })

    // prefer db books over openlibrary books, and put db books first
    const allBooks = [...dbBooks, ...books]

    books = allBooks.filter(
      (book, index) =>
        index ===
        allBooks.findIndex(
          (b) => b.openLibraryWorkId.toLowerCase() === book.openLibraryWorkId.toLowerCase(),
        ),
    )

    // dedupe rest of OL results by title
    books = books.filter(
      (book, index) => index === books.findIndex((b) => looseStringEquals(b.title, book.title)),
    )

    return {
      name: authorName,
      bio: wikipediaBio || bio,
      photoUrl,
      openLibraryAuthorId: authorId,
      books,
      wikipediaUrl,
    }
  },

  getOlWorkPageUrl: (workId: string) => `${BASE_URL}/works/${workId}`,

  getCoverUrlsForWork: async (workId: string) => {
    // get work
    const workUrl = `${BASE_URL}/works/${workId}.json`
    const work = await fetchJsonWithUserAgentHeaders(workUrl)

    const workCoverIds = work.covers || []

    // get editions (up to 50 by default)
    const editionsUrl = `${BASE_URL}/works/${workId}/editions.json`
    const editionsRes = await fetchJsonWithUserAgentHeaders(editionsUrl)
    const editions = editionsRes.entries

    const editionsCoverIds = editions.map((edition: any) => edition.covers || []).flat()

    // de-dupe cover ids
    const allCoverIds = workCoverIds.concat(editionsCoverIds).filter(Boolean)
    const uniqueSet = new Set(allCoverIds)
    const uniqueCoverIds = Array.from(uniqueSet) as number[]

    const coverUrls = uniqueCoverIds.map((coverId) =>
      OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, OpenLibraryCoverSize.L),
    )

    return coverUrls
  },

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

  getAuthorImageUrl: (id: string | number, size: OpenLibraryCoverSize) =>
    `${AUTHOR_IMAGE_BASE_URL}/${id}-${size}.jpg`,

  sortedEditionsByPubDate: (editions) =>
    [...editions].sort((editionA, editionB) => {
      const pubDateA = dayjs(editionA.publishDate, PUBLISH_DATE_FORMATS)
      const pubDateB = dayjs(editionB.publishDate, PUBLISH_DATE_FORMATS)
      return pubDateA.isAfter(pubDateB) ? 1 : -1
    }),

  search: async (_searchString: string, { includeEditions = false, limit = 3 }) => {
    const searchString = prepStringForSearch(_searchString)

    let searchFields = [
      "key",
      "title",
      "author_name",
      "author_key",
      "cover_i",
      "edition_count",
      "first_publish_year",
      "isbn",
      "oclc",
      "lccn",
    ]

    if (includeEditions) {
      searchFields = [...searchFields, "editions", "editions.*"]
    }

    const baseSearchUrl = `${BASE_URL}/${PATHS.search}`
    const url = new URL(baseSearchUrl)
    url.searchParams.append("q", searchString)
    url.searchParams.append("lang", OL_LANGUAGE_CODE)
    url.searchParams.append("fields", searchFields.join(","))

    const resBody = await fetchJsonWithUserAgentHeaders(url)
    let results = resBody.docs // returns up to 100 results per page
    let moreResultsExist = resBody.numFound > results.length

    // filter out unreliable results and apply limit
    // so far some markers of unreliable results (based on trial and error) include:
    // + no isbn/oclc/lccn
    // + no author name
    function hasBookCode(result) {
      return result.isbn || result.oclc || result.lccn
    }

    function hasAuthorName(result) {
      return result.authorName && result.authorName.length > 0
    }

    results = results.filter((result: any) => hasBookCode(result) && hasAuthorName(result))

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
      const openLibraryAuthorId = result.authorKey?.[0]
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
        openLibraryAuthorId,
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
