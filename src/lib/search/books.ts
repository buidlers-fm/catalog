import uFuzzy from "@leeoniya/ufuzzy"
import { looseStringEquals, stripPunctuation } from "lib/helpers/general"
import type Book from "types/Book"

const search = {
  // remove all records that have (approx) the same title and author name
  // as an earlier record
  dedupe: (results: Book[]) =>
    results.filter(
      (book, index, _results) =>
        index ===
        _results.findIndex(
          (_result) =>
            looseStringEquals(book.title, _result.title) &&
            looseStringEquals(book.authorName, _result.authorName),
        ),
    ),

  // score by combination of openlibrary ranking and our fuzzy search ranking
  sortByQualityScore: (results: Book[], searchString: string) => {
    const resultsByFuzzySearch = search.sortByFuzzySearch(results, searchString)

    const decoratedResults = results.map((result, idx) => {
      const fuzzySearchIndex = resultsByFuzzySearch.findIndex(
        (r) => r.openLibraryWorkId === result.openLibraryWorkId,
      )

      return {
        result,
        originalIndex: idx,
        fuzzySearchIndex,
      }
    })

    const scoreForResult = (decoratedResult) => {
      const { originalIndex, fuzzySearchIndex } = decoratedResult

      // avoid 0 values because multiplication
      const originalIndexScore = originalIndex + 1
      const fuzzySearchIndexScore = fuzzySearchIndex + 1

      const totalScore = originalIndexScore * fuzzySearchIndexScore

      return totalScore
    }

    const rankedResults = [...decoratedResults]
      // remove results that fail fuzzy search
      .filter((decoratedResult) => decoratedResult.fuzzySearchIndex !== -1)
      .sort((a, b) => scoreForResult(a) - scoreForResult(b))
      .map((decoratedResult) => decoratedResult.result)

    return rankedResults
  },

  sortByFuzzySearch: (results: Book[], searchString: string) => {
    // allow 1 character inserted / substituted / transposed / deleted
    // in each word
    const options = {
      intraMode: 1,
      intraIns: 1,
      intraSub: 1,
      intraTrn: 1,
      intraDel: 1,
    }

    // making an exception for weird name of this library
    // eslint-disable-next-line new-cap
    const uFuzzyClient = new uFuzzy(options as any)

    const haystack = results.map(
      (result) => `${stripPunctuation(result.title)} ${stripPunctuation(result.authorName)}`,
    )

    const needle = stripPunctuation(searchString)

    const [matchingIndexes, , orderedIndexes] = uFuzzyClient.search(haystack, needle, 1)

    let orderedResults: Book[] = []

    if (orderedIndexes) {
      orderedResults = orderedIndexes.map((idx) => results[idx])
    } else if (matchingIndexes && matchingIndexes.length > 0) {
      orderedResults = matchingIndexes.map((idx) => results[idx])
    }

    return orderedResults
  },

  // primary method to run all the steps
  processResults: (_results: Book[], searchString: string, options: any = {}) => {
    const { applyFuzzySearch } = options

    let results = _results

    if (applyFuzzySearch) {
      results = search.sortByQualityScore(results, searchString)
    }

    results = search.dedupe(results)

    return results
  },
}

export default search
