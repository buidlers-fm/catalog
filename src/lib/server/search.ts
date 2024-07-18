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

async function searchPeople(searchString) {
  const LIMIT = 8 // just an arbitrary small value to cap it at

  // case-insensitive exact substring search OR full-text search
  // the former (`ILIKE` queries) handles exact search strings that aren't full words
  // the latter handles "fuzziness", via `similarity` (%, from pg_trgm extension)
  // which handles more random misspellings
  const results = await prisma.$queryRaw`
    SELECT id, name, slug, title, org_name, image_url,
      similarity(name, ${searchString}) as trigram
    FROM people 
    WHERE 
      name ILIKE ${`%${searchString}%`} OR 
      name % ${searchString}
    ORDER BY
      trigram DESC
    LIMIT
      ${LIMIT};
    `

  return results
}

async function searchUsers(searchString, options: any = {}) {
  const { followersOnly, currentUserProfile } = options

  if (followersOnly && !currentUserProfile) {
    throw new Error("currentUserProfile is required when searching for followers")
  }

  const LIMIT = 8 // just an arbitrary small value to cap it at

  let prismaQuery

  // case-insensitive exact substring search OR full-text search
  // the former (`ILIKE` queries) handles exact search strings that aren't full words
  // the latter handles "fuzziness" via `similarity` (%, from pg_trgm extension)
  // which handles more random misspellings

  if (followersOnly) {
    prismaQuery = prisma.$queryRaw`
    SELECT
      user_profiles.id,
      username,
      bio,
      user_id,
      avatar_url,
      display_name,
      location,
      website,
      user_profiles.created_at,
      user_profiles.updated_at,
      similarity(username || ' ' || display_name, ${searchString}) as trigram
    FROM user_profiles 
    JOIN interactions ON interactions.agent_id = user_profiles.id
      AND interactions.object_id = ${currentUserProfile.id}::uuid
      AND interactions.interaction_type = 'follow'
      AND interactions.object_type = 'user_profile'
    JOIN
      user_configs
      ON user_configs.user_profile_id = user_profiles.id  
    WHERE 
      (
        CASE user_configs.user_search_visibility 
          WHEN 'signed_in' THEN true
          WHEN 'friends' THEN
            (interactions.agent_id = user_configs.user_profile_id)
          ELSE 
            false
        END
      )
    AND
      (
        username ILIKE ${`%${searchString}%`} OR 
        display_name ILIKE ${`%${searchString}%`} OR 
        (username || ' ' || display_name) % ${searchString}
      )
    ORDER BY
      trigram DESC
    LIMIT
      ${LIMIT};
    `
  } else {
    prismaQuery = prisma.$queryRaw`
    SELECT
      user_profiles.id,
      username,
      bio,
      user_id,
      avatar_url,
      display_name,
      location,
      website,
      user_profiles.created_at,
      user_profiles.updated_at,
      similarity(username || ' ' || display_name, ${searchString}) as trigram,
      (
        CASE user_configs.user_search_visibility
          WHEN 'signed_in' THEN true
          WHEN 'friends' THEN
            EXISTS (SELECT 1 FROM interactions 
                    WHERE interactions.agent_id = user_profiles.id 
                    AND interactions.object_id = ${currentUserProfile.id}::uuid
                    AND interactions.interaction_type = 'follow'
                    AND interactions.object_type = 'user_profile')
          ELSE
            false
        END
      ) as visibility_check
    FROM user_profiles 
    JOIN
      user_configs
      ON user_configs.user_profile_id = user_profiles.id
    WHERE 
      (
        CASE user_configs.user_search_visibility 
          WHEN 'signed_in' THEN true
          WHEN 'friends' THEN
            EXISTS (SELECT 1 FROM interactions 
                    WHERE interactions.agent_id = user_profiles.id 
                    AND interactions.object_id = ${currentUserProfile.id}::uuid
                    AND interactions.interaction_type = 'follow'
                    AND interactions.object_type = 'user_profile')
          ELSE 
            false
        END
      )
    AND
      (
        username ILIKE ${`%${searchString}%`} OR 
        display_name ILIKE ${`%${searchString}%`} OR 
        (username || ' ' || display_name) % ${searchString}
      )
    ORDER BY
      trigram DESC
    LIMIT
      ${LIMIT};
    `
  }

  const results = await prismaQuery

  console.log(results[0])

  return humps.camelizeKeys(results)
}

export { searchExistingBooks, searchPeople, searchUsers }
