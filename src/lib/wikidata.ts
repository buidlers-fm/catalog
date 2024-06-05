import { fetchJsonWithUserAgentHeaders } from "lib/helpers/general"

const WIKIDATA_BASE_URL = "https://wikidata.org/w/rest.php/wikibase/v0"
const WIKIDATA_ITEM_BASE_URL = `${WIKIDATA_BASE_URL}/entities/items`

const WIKIPEDIA_BASE_URL = "https://en.wikipedia.org/api/rest_v1"
const WIKIPEDIA_SUMMARY_BASE_URL = `${WIKIPEDIA_BASE_URL}/page/summary`

const GET_ITEM_DEFAULT_OPTIONS = {
  compact: false,
}

const Wikidata = {
  getItem: async (id: string, options: any = GET_ITEM_DEFAULT_OPTIONS) => {
    const { compact } = options

    const url = `${WIKIDATA_ITEM_BASE_URL}/${id}`
    const item = await fetchJsonWithUserAgentHeaders(url)

    const { labels, sitelinks } = item

    const name = labels.en
    const { title: siteTitle, url: siteUrl } = sitelinks.enwiki

    if (compact) {
      return { name, siteTitle, siteUrl }
    }

    const siteUrlFragment = sitelinks.enwiki.url.split("/").pop()
    const wikipediaSummaryUrl = `${WIKIPEDIA_SUMMARY_BASE_URL}/${siteUrlFragment}`

    const wikipediaSummaryRes = await fetchJsonWithUserAgentHeaders(wikipediaSummaryUrl)
    const wikipediaSummary = wikipediaSummaryRes.extract

    let imageUrl
    if (wikipediaSummaryRes.thumbnail) {
      imageUrl = wikipediaSummaryRes.thumbnail.source
    }

    return {
      name,
      siteTitle,
      siteUrl,
      summary: wikipediaSummary,
      imageUrl,
    }
  },
}

export default Wikidata
