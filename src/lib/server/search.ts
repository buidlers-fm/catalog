import humps from "humps"
import prisma from "lib/prisma"

async function searchExistingBooks(searchString) {
  const LIMIT = 20 // just an arbitrary small value to cap it at

  // case-insensitive exact substring search OR full-text search
  // the former (`ILIKE` queries) handles exact search strings that aren't full words
  // the latter handles "fuzziness", divided into:
  // `tsquery` (@@, native postgres) which handles word stems (non-consecutive words,
  // plurals, verb endings)
  // and `similarity` (%, from pg_trgm extension) which handles more random misspellings
  const results = await prisma.$queryRaw`
    SELECT id, slug, title, author_name, cover_image_url, editions_count,
      first_published_year, open_library_work_id, is_translated, original_title,
      cover_image_thumbnail_url, open_library_cover_image_url,
      similarity(title || ' ' || author_name || ' ' || original_title, ${searchString}) as trigram,
      ts_rank(title_author_search, websearch_to_tsquery('english', ${searchString})) as ts_rank
    FROM books 
    WHERE 
      title ILIKE ${`%${searchString}%`} OR 
      author_name ILIKE ${`%${searchString}%`} OR 
      websearch_to_tsquery('english', ${searchString}) @@ title_author_search OR
      (title || ' ' || author_name || ' ' || original_title) % ${searchString}
    ORDER BY
      trigram DESC,
      ts_rank DESC
    LIMIT
      ${LIMIT};
    `

  return results
}

async function searchUsers(searchString) {
  const LIMIT = 8 // just an arbitrary small value to cap it at

  // case-insensitive exact substring search OR full-text search
  // the former (`ILIKE` queries) handles exact search strings that aren't full words
  // the latter handles "fuzziness" via `similarity` (%, from pg_trgm extension)
  // which handles more random misspellings
  const results = await prisma.$queryRaw`
    SELECT id, username, bio, user_id, avatar_url, display_name, location, website, created_at, updated_at,
      similarity(username || ' ' || display_name, ${searchString}) as trigram
    FROM user_profiles 
    WHERE 
      username ILIKE ${`%${searchString}%`} OR 
      display_name ILIKE ${`%${searchString}%`} OR 
      (username || ' ' || display_name) % ${searchString}
    ORDER BY
      trigram DESC
    LIMIT
      ${LIMIT};
    `

  return humps.camelizeKeys(results)
}

export { searchExistingBooks, searchUsers }
