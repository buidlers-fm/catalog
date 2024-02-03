import prisma from "lib/prisma"

async function getUserProfilesByDistinctBooksEdited(limit = 100) {
  const results = (await prisma.$queryRaw`
    SELECT 
      "editor_id",
      COUNT(DISTINCT "edited_object_id") AS "book_count"
    FROM 
      "edit_logs"
    WHERE 
      "edited_object_type" = 'book'
    GROUP BY 
      "editor_id"
    ORDER BY 
      "book_count" DESC
    LIMIT ${limit}
  `) as { editor_id: string; book_count: BigInt }[]

  const userProfileIds = results.map((result) => result.editor_id)

  const userProfiles = await prisma.userProfile.findMany({
    where: {
      id: {
        in: userProfileIds,
      },
    },
  })

  const userProfilesById = userProfiles.reduce((acc, userProfile) => {
    acc[userProfile.id] = userProfile
    return acc
  }, {})

  return results.map(({ book_count: bookCount, editor_id: editorId }) => ({
    bookCount: Number(bookCount),
    userProfile: userProfilesById[editorId],
  }))
}

export { getUserProfilesByDistinctBooksEdited }
