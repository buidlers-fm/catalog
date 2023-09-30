import { fetchJson } from "lib/helpers/general"
import type Book from "types/Book"

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
    console.log(work)

    // get editions and first book data
    const editionsUrl = `${BASE_URL}/works/${workId}/editions.json`
    const editionsRes = await fetchJson(editionsUrl)
    const editions = editionsRes.entries
    const bookData = editions.sort((a, b) => {
      if (!a.latestRevision) return 1
      if (!b.latestRevision) return -1
      return b.latestRevision - a.latestRevision
    })[0]

    // get author from work
    let authorName
    const authorKey = work.authors?.[0]?.author?.key
    console.log(authorKey)
    if (authorKey) {
      const authorUrl = `${BASE_URL}/${authorKey}.json`
      const author = await fetchJson(authorUrl)
      authorName = author.name
    }

    const getCoverUrl = (coverId: string) =>
      OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, CoverSize.L)

    // get cover image
    let coverImageUrl
    if (bookData && bookData.covers && bookData.covers.length > 0) {
      coverImageUrl = getCoverUrl(bookData.covers[0])
    }

    // if cover image is missing, try to get from another edition
    if (!coverImageUrl) {
      const editionWithCover = editions.find(
        (edition: any) => edition.covers && edition.covers.length > 0,
      )
      if (editionWithCover) {
        coverImageUrl = getCoverUrl(editionWithCover.covers[0])
      }
    }

    // but work cover might be the best of all
    if (work && work.covers && work.covers.length > 0) {
      coverImageUrl = getCoverUrl(work.covers[0])
    }

    // polyfill schema inconsistencies
    const description = work.description?.value || work.description || "No description found."

    // consolidate publishers
    let publishers = editions.map((edition: any) => edition.publishers).flat()
    publishers = publishers.filter(
      (publisher: string, idx: number) => publishers.indexOf(publisher) === idx,
    )

    const book: Book = {
      title: work.title,
      subtitle: bookData.subtitle,
      by: authorName,
      description,
      coverImageUrl: coverImageUrl!,
      publisherName: publishers.join(", "),
      publishDate: bookData.publishDate,
      openlibraryWorkId: workId,
    }

    return book
  },

  getOlWorkPageUrl: (workId: string) => `${BASE_URL}/works/${workId}`,

  getCoverUrl: (coverUrlType: CoverUrlType, id: string | number, size: CoverSize) =>
    `${COVERS_BASE_URL}/${coverUrlType}/${id}-${size}.jpg`,

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
    results = results.filter(
      (result: any) => !result.publisher?.includes("Independently Published"),
    )

    // there are more pages of results in openlibrary OR
    // there are more filtered results than the limit
    moreResultsExist = moreResultsExist || results.length > limit
    results = results.slice(0, limit)

    results.forEach((result: any) => {
      const { title, coverI: coverId } = result
      const author = result.authorName?.join(", ")
      const openlibraryBookId = result.editionKey?.[0]
      const openlibraryWorkId = result.key.split("/works/").pop()

      const isDup = books.some((book) => book.title === title && book.by === author)
      if (isDup) return

      const book = {
        title,
        by: author,
        openlibraryBookId,
        openlibraryWorkId,
        coverImageUrl:
          coverId && OpenLibrary.getCoverUrl(CoverUrlType.CoverId, coverId, CoverSize.M),
      }

      books.push(book)
    })

    return { resultsForPage: books, moreResultsExist }
  },
}

export default OpenLibrary
