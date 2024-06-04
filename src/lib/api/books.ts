import prisma from "lib/prisma"
import OpenLibrary from "lib/openLibrary"
import { uploadCoverImage } from "lib/server/supabaseStorage"
import { generateUniqueSlug, fetchImageAsBlob } from "lib/helpers/general"
import { reportToSentry } from "lib/sentry"
import CoverSize from "enums/CoverSize"
import ListedObjectType from "enums/ListedObjectType"
import ListDesignation from "enums/ListDesignation"
import InteractionType from "enums/InteractionType"
import InteractionObjectType from "enums/InteractionObjectType"
import UserBookShelf from "enums/UserBookShelf"
import Visibility from "enums/Visibility"
import PersonBookRelationType from "enums/PersonBookRelationType"
import type Book from "types/Book"
import type BookActivity from "types/BookActivity"

async function findOrCreateBook(_book: Book, options: any = {}) {
  const { processCoverImage = true, createAuthor = true } = options

  const existingBook = await prisma.book.findFirst({
    where: {
      openLibraryWorkId: _book.openLibraryWorkId,
    },
  })

  if (existingBook) return existingBook

  const {
    title,
    subtitle,
    authorName,
    description,
    coverImageUrl,
    coverImageThumbnailUrl,
    openLibraryCoverImageUrl,
    openLibraryWorkId,
    openLibraryAuthorId,
    editionsCount,
    firstPublishedYear,
    isTranslated,
    originalTitle,
    wikipediaUrl,
  } = _book

  const slug = await generateUniqueSlug(`${title} ${authorName}`, "book")

  const createdBook = await prisma.book.create({
    data: {
      slug,
      title,
      subtitle,
      authorName,
      description,
      coverImageUrl,
      coverImageThumbnailUrl,
      openLibraryCoverImageUrl,
      openLibraryWorkId,
      openLibraryAuthorId,
      editionsCount,
      firstPublishedYear: Number(firstPublishedYear),
      isTranslated,
      originalTitle,
      wikipediaUrl,
    },
  })

  if (createAuthor) {
    // try to fetch author info
    let author

    if (openLibraryAuthorId) {
      const existingPerson = await prisma.person.findFirst({
        where: {
          openLibraryAuthorId,
        },
      })

      if (existingPerson) {
        author = existingPerson
      } else {
        try {
          const openLibraryAuthor = await OpenLibrary.getAuthor(openLibraryAuthorId)

          const authorSlug = await generateUniqueSlug(openLibraryAuthor.name, "person")

          if (openLibraryAuthor) {
            author = await prisma.person.create({
              data: {
                slug: authorSlug,
                name: openLibraryAuthor.name,
                imageUrl: openLibraryAuthor.imageUrl,
                wikipediaUrl: openLibraryAuthor.wikipediaUrl,
                bio: openLibraryAuthor.bio,
                openLibraryAuthorId,
                wikidataId: openLibraryAuthor.wikidataId,
              },
            })
          }
        } catch (error) {
          reportToSentry(error, {
            method: "findOrCreateBook.getAuthor",
            book: _book,
            openLibraryAuthorId,
          })
        }
      }
    }

    // if the above failed, create author person without extra info
    if (!author && authorName) {
      const authorSlug = await generateUniqueSlug(authorName, "person")

      author = await prisma.person.create({
        data: {
          slug: authorSlug,
          name: authorName,
        },
      })
    }

    // create person-book relation
    if (author) {
      await prisma.personBookRelation.create({
        data: {
          personId: author.id,
          bookId: createdBook.id,
          relationType: PersonBookRelationType.Author,
        },
      })
    }
  }

  // fetch covers and upload to supabase storage, then update cover image urls on book
  if (coverImageUrl && processCoverImage) {
    const baseOptions = {
      bookId: createdBook.id,
      bookSlug: slug,
      extension: coverImageUrl.split(".").pop(),
    }

    const { md: olThumbnailUrl, lg: olLargeUrl } = OpenLibrary.getCoverUrlsBySize(coverImageUrl)

    try {
      const { blob: thumbnailBlob, mimeType: thumbnailMimeType } = await fetchImageAsBlob(
        olThumbnailUrl,
      )

      const thumbnailOptions = {
        ...baseOptions,
        size: CoverSize.Md,
        mimeType: thumbnailMimeType,
      }

      const thumbnailUrl = await uploadCoverImage(thumbnailBlob, thumbnailOptions)

      const { blob: largeBlob, mimeType: largeMimeType } = await fetchImageAsBlob(olLargeUrl)

      const largeOptions = {
        ...baseOptions,
        size: CoverSize.Lg,
        mimeType: largeMimeType,
      }

      const largeUrl = await uploadCoverImage(largeBlob, largeOptions)

      await prisma.book.update({
        where: {
          id: createdBook.id,
        },
        data: {
          coverImageUrl: largeUrl,
          coverImageThumbnailUrl: thumbnailUrl,
          openLibraryCoverImageUrl: coverImageUrl,
        },
      })
    } catch (error) {
      reportToSentry(error, {
        bookId: createdBook.id,
        coverImageUrl,
      })
    }
  }

  return createdBook
}

async function getBookActivity(book, currentUserProfile): Promise<BookActivity> {
  // get shelf counts
  const allShelfAssignments = await prisma.userBookShelfAssignment.findMany({
    where: {
      bookId: book.id,
    },
    include: {
      userProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const totalShelfCounts = allShelfAssignments.reduce(
    (result, assignment) => ({
      ...result,
      [assignment.shelf as UserBookShelf]: (result[assignment.shelf] || 0) + 1,
    }),
    {} as any,
  )

  // get favorited count
  const favoritedAssignments = await prisma.listItemAssignment.findMany({
    where: {
      listedObjectId: book.id,
      listedObjectType: ListedObjectType.Book,
      list: {
        designation: ListDesignation.Favorite,
      },
    },
    include: {
      list: {
        include: {
          creator: true,
        },
      },
    },
  })

  // get friends data
  let shelvesToFriendsProfiles: any = {}
  let likedByFriendsProfiles: any[] = []
  let favoritedByFriendsProfiles: any[] = []

  if (currentUserProfile) {
    const allCurrentUserFollows = await prisma.interaction.findMany({
      where: {
        agentId: currentUserProfile.id,
        objectType: InteractionObjectType.User,
        interactionType: InteractionType.Follow,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    const allFollowedIds = new Set(allCurrentUserFollows.map((follow) => follow.objectId))

    let friendsShelfAssignments = allShelfAssignments.filter((assignment) =>
      allFollowedIds.has(assignment.userProfile.id),
    )

    // filter out shelves that are not visible to the current user
    const allUserConfigs = await prisma.userConfig.findMany({
      where: {
        userProfileId: {
          in: friendsShelfAssignments.map((assignment) => assignment.userProfileId),
        },
      },
    })

    const allUserConfigsByUserProfileId = allUserConfigs.reduce(
      (result, config) => ({
        ...result,
        [config.userProfileId]: config,
      }),
      {},
    )

    const allFriendCurrentUserFollows = await prisma.interaction.findMany({
      where: {
        agentId: {
          in: friendsShelfAssignments.map((assignment) => assignment.userProfileId),
        },
        interactionType: InteractionType.Follow,
        objectId: currentUserProfile.id,
        objectType: InteractionObjectType.User,
      },
    })

    friendsShelfAssignments = friendsShelfAssignments.filter((assignment) => {
      const { userProfileId } = assignment

      const userConfig = allUserConfigsByUserProfileId[userProfileId]

      if (
        userConfig.shelvesVisibility === Visibility.Public ||
        userConfig.shelvesVisibility === Visibility.SignedIn
      ) {
        return true
      }

      if (userConfig.shelvesVisibility === Visibility.Self) {
        return false
      }

      // visibility is Friends
      const friendFollowsCurrentUser = allFriendCurrentUserFollows.some(
        (follow) => follow.agentId === userProfileId,
      )

      return friendFollowsCurrentUser
    })

    shelvesToFriendsProfiles = friendsShelfAssignments.reduce(
      // if shelf is already in the results, append the user profile to that shelf's array
      // of friend profiles; otherwise, add the shelf to the results with a starting array
      (result, assignment) => ({
        ...result,
        [assignment.shelf]: [...(result[assignment.shelf] || []), assignment.userProfile],
      }),
      {},
    )

    const friendsLikes = await prisma.interaction.findMany({
      where: {
        agentId: {
          in: Array.from(allFollowedIds),
        },
        objectType: InteractionObjectType.Book,
        objectId: book.id,
        interactionType: InteractionType.Like,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const likedByFriendsProfileIds = friendsLikes.map((like) => like.agentId)

    likedByFriendsProfiles = await prisma.userProfile.findMany({
      where: {
        id: {
          in: likedByFriendsProfileIds,
        },
      },
    })

    likedByFriendsProfiles.sort((a: any, b: any) => {
      const aIndex = likedByFriendsProfileIds.indexOf(a.id)
      const bIndex = likedByFriendsProfileIds.indexOf(b.id)

      return aIndex - bIndex
    })

    favoritedByFriendsProfiles = favoritedAssignments
      .filter((assignment) => allFollowedIds.has(assignment.list.creatorId))
      .map((assignment) => assignment.list.creator)
  }

  const activity: BookActivity = {
    totalShelfCounts,
    totalFavoritedCount: favoritedAssignments.length,
    shelvesToFriendsProfiles,
    likedByFriendsProfiles,
    favoritedByFriendsProfiles,
  }

  return activity
}

export { findOrCreateBook, getBookActivity }
